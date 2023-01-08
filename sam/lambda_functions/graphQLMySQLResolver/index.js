const gqlRequest = require("graphql-request");
const handler = require("./helpers.js");
const { SES, SNS, SecretsManager } = require("aws-sdk");
const ses = new SES();
const sns = new SNS();
const SES_FROM_ADDRESS = process.env.EMAIL_SENDER;
const LINK_TO_APP = process.env.LINK_TO_APP;

const mysql = require("mysql");
let dbInit = false;

async function conditionallyCreateDB(connection) {
  // if the database has not yet been made, make it
  // otherwise, this throws an error, which is caught in the handler and
  // the lambda handler function proceeds as usual
  let adminName = process.env.ADMIN_NAME;
  // let adminEmail = process.env.ADMIN_EMAIL;
  let createDBSQL = `
  CREATE TABLE \`User\` (
  \`user_id\` int PRIMARY KEY AUTO_INCREMENT,
  \`email_address\` text UNIQUE NOT NULL,
  \`phone_address\` text UNIQUE,
  \`postal_code\` varchar(10) COMMENT 'has to be a valid postal code',
  \`province\` ENUM ('AB', 'BC', 'MB', 'NB', 'NL', 'NT', 'NS', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT') NOT NULL,
  \`language\` ENUM ('en', 'fr') NOT NULL
  \`email_notice\` boolean NOT NULL,
  \`sms_notice\` boolean NOT NULL
);

CREATE TABLE \`Category\` (
  \`category_id\` int PRIMARY KEY AUTO_INCREMENT,
  \`picture_location\` text
);

CREATE TABLE \`CategoryInfo\` (
  \`category_id\` int,
  \`language\` ENUM ('en', 'fr') NOT NULL,
  \`title\` varchar(100) NOT NULL,
  \`description\` text,
  PRIMARY KEY (\`category_id\`, \`language\`)
);

CREATE TABLE \`Topic\` (
  \`topic_id\` int PRIMARY KEY AUTO_INCREMENT
);

CREATE TABLE \`TopicInfo\` (
  \`topic_id\` int,
  \`language\` ENUM ('en', 'fr') NOT NULL,
  \`name\` varchar(40) UNIQUE NOT NULL,
  PRIMARY KEY (\`topic_id\`, \`language\`)
);

CREATE TABLE \`CategoryTopic\` (
  \`categoryTopic_id\` int PRIMARY KEY AUTO_INCREMENT,
  \`category_id\` int NOT NULL,
  \`topic_id\` int NOT NULL
);

CREATE TABLE \`UserCategoryTopic\` (
  \`user_id\` Int NOT NULL,
  \`categoryTopic_id\` int NOT NULL,
  \`email_notice\` boolean NOT NULL,
  \`sms_notice\` boolean NOT NULL,
  PRIMARY KEY (\`user_id\`, \`categoryTopic_id\`)
);


CREATE INDEX \`User_index_0\` ON \`User\` (\`email_address\`);

CREATE UNIQUE INDEX \`CategoryTopic_index_1\` ON \`CategoryTopic\` (\`category_id\`, \`topic_id\`);


ALTER TABLE \`CategoryTopic\` ADD FOREIGN KEY (\`category_id\`) REFERENCES \`Category\` (\`category_id\`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE \`CategoryInfo\` ADD FOREIGN KEY (\`category_id\`) REFERENCES \`Category\` (\`category_id\`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE \`CategoryTopic\` ADD FOREIGN KEY (\`topic_id\`) REFERENCES \`Topic\` (\`topic_id\`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE \`TopicInfo\` ADD FOREIGN KEY (\`topic_id\`) REFERENCES \`Topic\` (\`topic_id\`) ON DELETE CASCADE ON UPDATE CASCADE;

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

  // result = await executeSQL(
  //   connection,
  //   "INSERT INTO \`User\` (email_address) VALUES ('" + adminEmail + "');"
  // );

  return result;
}

function executeSQL(connection, sql_statement) {
  // executes an sql statement as a promise, with included error handling
  return new Promise((resolve, reject) => {
    console.log("Executing SQL:", sql_statement);
    connection.query({ sql: sql_statement, timeout: 60000 }, (err, data) => {
      // if error, gets saved in \\\`err\\\`, else response from DB saved in \\\`data\\\`
      if (err) {
        return reject(err);
      }
      console.log("executeSQL return: ", data);
      return resolve(data);
    });
  });
}

function populateAndSanitizeSQL(sql, SQLVariableMapping, connection) {
  // takes the variable mapping JSON, and inserts them into the sql string
  // for each pair in SQLVariableMapping, replace the key with value in sql
  Object.entries(SQLVariableMapping).forEach(([key, value]) => {
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
    console.log("key: ", key);
    console.log("escapedVal: ", escapedValue);
    sql = sql.replace(key, escapedValue);
  });

  return sql;
}

exports.handler = async (event) => {
  const secretName = "RDSCredentials";
  const endpointUrl = "https://secretsmanager.us-east-1.amazonaws.com";
  const region = "ca-central-1";

  var params = {
    SecretId: secretName,
  };
  let secret;
  let sm = new SecretsManager({ region: region });
  console.log("137");
  try {
    secret = await sm.getSecretValue(params).promise();
    secret = JSON.parse(secret.SecretString);
    console.log("secret:", secret);
  } catch (e) {
    console.log("e:", e);
  }

  let connection;
  console.log("secret: ", secret);
  console.log("type of secret: ", typeof secret);
  console.log("user:", secret.username);
  console.log("password: ", secret.password);
  connection = mysql.createPool({
    host: process.env.RDSPROXY_ENDPOINT,
    // user: process.env.USERNAME,
    // password: process.env.PASSWORD,
    user: secret.username,
    password: secret.password,
    database: process.env.DBNAME,
  });
  console.log("connection:", connection);

  console.log("event: ", event);
  // called whenever a GraphQL event is received
  console.log("Received event", JSON.stringify(event, null, 3));

  let result = {};
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
  // try {
  for (let sql_statement of sql_statements) {
    // iterate through the SQL statements
    if (sql_statement.length < 3) {
      // sometimes an empty statement will try to be executed, this stops those from executing
      continue;
    }
    // 'fill in' the variables in the sql statement with ones from SQLVariableMapping
    const inputSQL = populateAndSanitizeSQL(
      sql_statement,
      event.SQLVariableMapping,
      connection
    );
    // execute the sql statement on our database
    result.sqlResult = await executeSQL(connection, inputSQL);
  }

  // for secondary SQL statement to execute, like a SELECT after an INSERT
  if (event.responseSQL) {
    const responseSQL = populateAndSanitizeSQL(
      event.responseSQL,
      event.SQLVariableMapping,
      connection
    );
    result.sqlResult = await executeSQL(connection, responseSQL);
  }
  console.log("Finished SQL execution");
  console.log("sqlResult: ", result.sqlResult);

  try {
    if (event.pinpoint) {
      const pinpointAction = event.pinpoint;
      switch (pinpointAction.type) {
        case "userprofile":
          switch (pinpointAction.action) {
            case "insert":
            case "update":
              console.log(event.SQLVariableMapping);
              let upsertUserProfileResponse = await handler.upsertUserProfile(
                result.sqlResult[0].user_id.toString(),
                event.SQLVariableMapping[":province"],
                event.SQLVariableMapping[":postal_code"]
              );
              console.log(
                "upsertUserProfile response: ",
                upsertUserProfileResponse
              );

              if (event.SQLVariableMapping[":email_address"]) {
                let upsertEmailResponse = await handler.upsertEndpoint(
                  result.sqlResult[0].user_id.toString(),
                  "EMAIL" + "_" + result.sqlResult[0].user_id.toString(),
                  event.SQLVariableMapping[":email_address"],
                  "EMAIL"
                );
                console.log("upsert email response: ", upsertEmailResponse);

                if (
                  pinpointAction.action === "insert" &&
                  event.SQLVariableMapping[":email_notice"] === true
                ) {
                  await sendNotification(
                    event.SQLVariableMapping[":email_address"],
                    "email"
                  );
                }
              }

              if (event.SQLVariableMapping[":phone_address"]) {
                let upsertPhoneResponse = await handler.upsertEndpoint(
                  result.sqlResult[0].user_id.toString(),
                  "SMS" + "_" + result.sqlResult[0].user_id.toString(),
                  event.SQLVariableMapping[":phone_address"],
                  "SMS"
                );
                console.log("upsert phone no. response: ", upsertPhoneResponse);
                result.pinpointResult = "success";

                if (
                  pinpointAction.action === "insert" &&
                  event.SQLVariableMapping[":sms_notice"] === true
                ) {
                  await sendNotification(
                    event.SQLVariableMapping[":phone_address"],
                    "sms"
                  );
                }
              }
              result.pinpointResult = "success";

              break;
            case "delete":
              result = await handler.deleteUser(
                event.SQLVariableMapping[":user_id"].toString()
              );
              result.pinpointResult = "success";
              break;
          }
          break;
        case "usersubscription":
          switch (pinpointAction.action) {
            case "insert":
            case "update":
              result.pinpointResult = await handler.updateTopicChannel(
                event.SQLVariableMapping[":user_id"],
                event.SQLVariableMapping[":category_acronym"] +
                  "-" +
                  event.SQLVariableMapping[":topic_acronym"],
                event.SQLVariableMapping[":email_notice"],
                event.SQLVariableMapping[":sms_notice"]
              );
              break;
            case "delete":
              result.pinpointResult = await handler.updateTopicChannel(
                event.SQLVariableMapping[":user_id"],
                event.SQLVariableMapping[":category_acronym"] +
                  "-" +
                  event.SQLVariableMapping[":topic_acronym"],
                false,
                false
              );
              result.pinpointResult = "success";
              break;
          }
          break;
      }
    }
  } catch (err) {
    result.pinpointResult = err;
    Promise.reject(err);
  }

  console.log("return: ", result);
  return result;
};

async function sendNotification(address, type) {
  let result = {};
  if (type === "email") {
    let categoryTopicsHTML = `You are now subscribed to ISED! Click here to manage your notification preferences: ${LINK_TO_APP}`;
    let params = {
      Destination: { ToAddresses: [address] },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: `<html><body><p>${categoryTopicsHTML}</p></body></html>`,
          },
          Text: {
            Charset: "UTF-8",
            Data: `${categoryTopicsHTML}`,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: "ISED Subscription",
        },
      },
      Source: SES_FROM_ADDRESS,
    };
    console.log("email sending info:", params);
    result.email = await ses.sendEmail(params).promise();
  } else if (type === "sms") {
    let params = {
      Message: `You are now subscribed to ISED! Open the link to manage your notification preferences: ${LINK_TO_APP}`,
      PhoneNumber: address,
    };
    result.sms = await sns.publish(params).promise();
  }

  console.log("notification sent? ", result);
}

// async function executeGraphQL(query) {
//   console.log("executing query: ", query);
//   return new Promise((resolve, reject) => {
//     // let options = {
//     //   method: "POST",
//     //   headers: {
//     //     "x-api-key": GRAPHQL_API_KEY,
//     //   },
//     //   body: JSON.stringify({ query, variables }),
//     // };
//     let gqlQuery = gqlRequest.gql([query]);

//     const gqlClient = new gqlRequest.GraphQLClient(GRAPHQL_ENDPOINT, {
//       headers: {
//         "x-api-key": GRAPHQL_API_KEY,
//       },
//     });

//     gqlClient
//       .request(gqlQuery)
//       .then((response) => {
//         console.log("executeGraphQL response:", response);
//         return response;
//       })
//       .then((json) => {
//         console.log("executeGraphQL return:", JSON.stringify(json));
//         resolve(json);
//       })
//       .catch((err) => {
//         reject(err);
//       });
//   });
// }
