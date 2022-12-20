const gqlRequest = require("graphql-request");
const handler = require("./helpers.js");
const { SES, SNS, SecretsManager } = require("aws-sdk");
const ses = new SES();
const sns = new SNS();
const SES_FROM_ADDRESS = "mminting@student.ubc.ca";
const LINK_TO_APP = process.env.LINK_TO_APP;

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
  \`email_address\` text UNIQUE NOT NULL,
  \`phone_address\` varchar(50) UNIQUE,
  \`postal_code\` varchar(10) COMMENT 'has to be a valid postal code',
  \`province\` ENUM ('AB', 'BC', 'MB', 'NB', 'NL', 'NT', 'NS', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT') NOT NULL
  \`email_notice\` boolean NOT NULL,
  \`sms_notice\` boolean NOT NULL
  );

CREATE TABLE \`Category\` (
  \`category_id\` int PRIMARY KEY AUTO_INCREMENT,
  \`acronym\` varchar(30) UNIQUE NOT NULL,
  \`title\` varchar(50) NOT NULL,
  \`description\` text
);

CREATE TABLE \`Topic\` (
  \`topic_id\` int PRIMARY KEY AUTO_INCREMENT,
  \`acronym\` varchar(30) UNIQUE NOT NULL
);

CREATE TABLE \`CategoryTopic\` (
  \`categoryTopic_id\` int PRIMARY KEY AUTO_INCREMENT,
  \`category_acronym\` varchar(30) NOT NULL,
  \`topic_acronym\` varchar(30) NOT NULL
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
    "INSERT INTO `User` (email_address) VALUES ('" + adminEmail + "');"
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
    sql = sql.replace(key, escapedValue);
  });

  return sql;
}

exports.handler = async (event) => {
  const secretName = "RDSCredentials";
  const endpointUrl = "https://secretsmanager.us-east-1.amazonaws.com";
  const region = "ca-central-1";

  // var params = {
  //   SecretId: secretName,
  // };
  // let dbpassword;
  // let sm = new SecretsManager({ region: region });
  // console.log("137");
  // try {
  //   dbpassword = await sm.getSecretValue(params);
  //   console.log("password:", password);
  // } catch (e) {
  //   console.log("e:", e);
  // }
  // , function (err, data) {
  // console.log("139");
  // if (err) {
  //   console.log("err:");
  //   console.log(err, err.stack);
  // } // an error occurred
  // else {
  //   console.log("data:", data);
  // }
  // successful response
  /*
  data = {
  ARN: "arn:aws:secretsmanager:us-west-2:123456789012:secret:MyTestDatabaseSecret-a1b2c3", 
  CreatedDate: <Date Representation>, 
  Name: "MyTestDatabaseSecret", 
  SecretString: "{\n  \"username\":\"david\",\n  \"password\":\"EXAMPLE-PASSWORD\"\n}\n", 
  VersionId: "EXAMPLE1-90ab-cdef-fedc-ba987SECRET1", 
  VersionStages: [
      "AWSPREVIOUS"
  ]
  }
  */

  let connection;
  connection = mysql.createPool({
    host: process.env.RDSPROXY_ENDPOINT,
    user: process.env.USERNAME,
    password: process.env.PASSWORD,
    // password: dbpassword,
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
