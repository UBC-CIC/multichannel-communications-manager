const mysql = require("mysql");
let dbInit = false;

async function conditionallyCreateDB(connection) {
  // if the database has not yet been made, make it
  // otherwise, this throws an error, which is caught in the handler and
  // the lambda handler function proceeds as usual
  let adminName = process.env.ADMIN_NAME;
  let adminEmail = process.env.ADMIN_EMAIL;
  let createDBSQL = `
    CREATE TABLE \`User\` (
  \`user_id\` int PRIMARY KEY AUTO_INCREMENT,
  \`email_address\` varchar(50) UNIQUE NOT NULL,
  \`phone_address\` int UNIQUE,
  \`phone_id\` Int UNIQUE,
  \`postal_code\` varchar(10) COMMENT 'has to be a valid postal code',
  \`province\` ENUM ('AB', 'BC', 'MB', 'NB', 'NL', 'NT', 'NS', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT') NOT NULL
);

CREATE TABLE \`Category\` (
  \`category_id\` int PRIMARY KEY AUTO_INCREMENT,
  \`acronym\` varchar(10) UNIQUE NOT NULL COMMENT 'letters only',
  \`title\` varchar(50) NOT NULL,
  \`description\` text
);

CREATE TABLE \`Topic\` (
  \`topic_id\` int PRIMARY KEY AUTO_INCREMENT,
  \`acronym\` varchar(10) UNIQUE NOT NULL
);

CREATE TABLE \`CategoryTopic\` (
  \`categoryTopic_id\` int PRIMARY KEY AUTO_INCREMENT,
  \`category_acronym\` varchar(10) NOT NULL,
  \`topic_acronym\` varchar(10) NOT NULL
);

CREATE TABLE \`UserCategoryTopic\` (
  \`user_id\` Int NOT NULL,
  \`categoryTopic_id\` int NOT NULL,
  \`email_notice\` boolean NOT NULL,
  \`sms_notice\` boolean NOT NULL,
  PRIMARY KEY (\`user_id\`, \`categoryTopic_id\`)
);

CREATE INDEX \`User_index_0\` ON \`User\` (\`email_address\`);

CREATE INDEX \`Category_index_1\` ON \`Category\` (\`acronym\`);

CREATE INDEX \`Topic_index_2\` ON \`Topic\` (\`acronym\`);

CREATE UNIQUE INDEX \`CategoryTopic_index_3\` ON \`CategoryTopic\` (\`category_acronym\`, \`topic_acronym\`);

ALTER TABLE \`CategoryTopic\` ADD FOREIGN KEY (\`category_acronym\`) REFERENCES \`Category\` (\`acronym\`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE \`CategoryTopic\` ADD FOREIGN KEY (\`topic_acronym\`) REFERENCES \`Topic\` (\`acronym\`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE \`UserCategoryTopic\` ADD FOREIGN KEY (\`user_id\`) REFERENCES \`User\` (\`user_id\`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE \`UserCategoryTopic\` ADD FOREIGN KEY (\`categoryTopic_id\`) REFERENCES \`CategoryTopic\` (\`categoryTopic_id\`) ON DELETE CASCADE ON UPDATE CASCADE;
`;

  let result;
  let sql_statements = createDBSQL.split(";"); // splits up multiple SQL statements into an array
  for (let sql_statement of sql_statements) {
    // iterate through the SQL statements
    if (sql_statement.length < 3) {
      // sometimes an empty statement will try to be executed, this stops those from executing
      continue;
    }
    // execute the sql statement on our database
    result = await executeSQL(connection, sql_statement);
  }

  result = await executeSQL(
    connection,
    "INSERT INTO `User` (user_id, email_address) VALUES (0, '" +
      adminEmail +
      "')"
  );

  return result;
}

function executeSQL(connection, sql_statement) {
  // executes an sql statement as a promise, with included error handling
  return new Promise((resolve, reject) => {
    console.log("Executing SQL:", sql_statement);
    connection.query({ sql: sql_statement, timeout: 60000 }, (err, data) => {
      // if error, gets saved in \\`err\\`, else response from DB saved in \\`data\\`
      if (err) {
        return reject(err);
      }
      console.log("executeSQL return: ", data);
      return resolve(data);
    });
  });
}

function populateAndSanitizeSQL(sql, variableMapping, connection) {
  // takes the variable mapping JSON, and inserts them into the sql string
  // for each pair in variableMapping, replace the key with value in sql
  Object.entries(variableMapping).forEach(([key, value]) => {
    let escapedValue = connection.escape(value);
    if (
      String(escapedValue).length == 0 ||
      escapedValue == "''" ||
      escapedValue === "''" ||
      escapedValue.charAt(0) == "$" ||
      escapedValue.charAt(1) == "$"
    ) {
      // if in the GraphQL request, a user does not pass in the value of a variable required in the statement, set the variable to null
      escapedValue = null;
    }
    sql = sql.replace(key, escapedValue);
  });

  return sql;
}

let connection;
connection = mysql.createPool({
  host: process.env.RDSPROXY_ENDPOINT,
  user: process.env.USERNAME,
  password: process.env.PASSWORD,
  database: process.env.DBNAME,
});

exports.handler = async (event) => {
  // called whenever a GraphQL event is received
  console.log("Received event", JSON.stringify(event, null, 3));

  let result;
  if (!dbInit) {
    try {
      await conditionallyCreateDB(connection);
    } catch (error) {
      console.log(error);
      console.log(
        "The database has already been made, proceeding with the GQL request"
      );
    }
    dbInit = true;
  }

  let sql_statements = event.sql.split(";"); // splits up multiple SQL statements into an array
  for (let sql_statement of sql_statements) {
    // iterate through the SQL statements
    if (sql_statement.length < 3) {
      // sometimes an empty statement will try to be executed, this stops those from executing
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
