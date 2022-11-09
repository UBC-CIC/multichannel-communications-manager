const mysql = require("mysql");
let dbInit = false;
function executeSQL(connection, sql_statement) {
  // executes an sql statement as a promise
  // with included error handling
  return new Promise((resolve, reject) => {
    console.log("Executing SQL:", sql_statement);
    connection.query({ sql: sql_statement, timeout: 60000 }, (err, data) => {
      // if there is an error, it gets saved in err, else the response from DB saved in data

      if (err) {
        return reject(err);
      }
      return resolve(data);
    });
  });
}
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
let connection;
connection = mysql.createPool({
  host: process.env.RDS_ENDPOINT,
  user: process.env.USERNAME,
  password: process.env.PASSWORD,
  database: process.env.DBNAME,
});
exports.handler = async (event) => {
  // called whenever a GraphQL event is received
  console.log("Received event", JSON.stringify(event, null, 3));
  let result;
  // split up multiple SQL statements into an array
  let sql_statements = event.sql.split(";");
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
      event.variableMapping,
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
