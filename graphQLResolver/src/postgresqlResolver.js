let AWS = require("aws-sdk");
let { Pool, Client } = require("pg");
AWS.config.update({ region: "ca-central-1" });
let secretsManager = new AWS.SecretsManager();
const SM_EXAMPLE_DATABASE_CREDENTIALS = "psotgre-dev";
const URL_RDS_PROXY =
  "ised-postgre-dev.proxy-cl8adcwqdt44.ca-central-1.rds.amazonaws.com";

// let { SM_EXAMPLE_DATABASE_CREDENTIALS, URL_RDS_PROXY } = process.env;

let dbInit = false;

// Reference: https://cic.ubc.ca/2022/09/29/blending-old-and-new-with-rds-and-appsync/
function executeSQL(connection, sql_statement) {
  // executes an sql statement as a promise
  // with included error handling
  return new Promise((resolve, reject) => {
    console.log("Executing SQL:", sql_statement);
    connection.query(sql_statement, (err, data) => {
      // if there is an error, it gets saved in err, else the response from DB saved in data

      if (err) {
        return reject(err);
      }
      return resolve(data);
    });
  });
}

// Reference: https://cic.ubc.ca/2022/09/29/blending-old-and-new-with-rds-and-appsync/
function populateAndSanitizeSQL(sql, variableMapping, connection) {
  // iterates through the variableMapping JSON object, and replaces
  // the first instance of the key in the sql string with the value.
  // Also sanitizes the inputs for the values
  Object.entries(variableMapping).forEach(([key, value]) => {
    let escapedValue = connection.escape(value);
    // if in the GraphQL request, a user does not pass in the value of
    // a variable required in the statement, set the variable to null
    if (String(escapedValue).length == 0 || escapedValue.charAt(0) == "$") {
      escapedValue = null;
    }
    sql = sql.replace(key, escapedValue);
  });
  return sql;
}

exports.handler = async (event) => {
  let sm = await secretsManager
    .getSecretValue({ SecretId: SM_EXAMPLE_DATABASE_CREDENTIALS })
    .promise();
  let credentials = JSON.parse(sm.SecretString);

  let connectionConfig = {
    host: URL_RDS_PROXY,
    port: credentials.port,
    user: credentials.username,
    password: credentials.password,
    database: credentials.dbname,
    ssl: true,
  };

  let connection = new Pool(connectionConfig);
  let payload = event.payload;

  // called whenever a GraphQL event is received
  console.log("Received event", JSON.stringify(event, null, 3));
  let result;
  // split up multiple SQL statements into an array
  console.log(payload.sql);
  let sql_statements = payload.sql.split(";");
  // iterate through the SQL statements
  for (let sql_statement of sql_statements) {
    // sometimes an empty statement will try to be executed,
    // this stops those from executing
    if (sql_statement.length < 3) {
      continue;
    }
    // 'fill in' the variables in the sql statement with ones from variableMapping
    const inputSQL = populateAndSanitizeSQL(
      sql_statement,
      payload.variableMapping,
      connection
    );
    // execute the sql statement on our database
    result = await executeSQL(connection, inputSQL);
  }
  // for secondary SQL statement to execute, like a SELECT after an INSERT
  if (event.responseSQL) {
    const responseSQL = populateAndSanitizeSQL(
      event.responseSQL,
      event.variableMapping,
      connection
    );
    result = await executeSQL(connection, responseSQL);
  }
  console.log("Finished execution");
  return result;
};
