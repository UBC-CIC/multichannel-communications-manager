// import { default as fetch, Request } from "node-fetch";
// const fetch = require("node-fetch");
// import { resolve } from "path";
// const _importDynamic = new Function("modulePath", "return import(modulePath)");
// export const fetch = async function (...args: any) {
//   const { default: fetch } = await _importDynamic("node-fetch");
//   return fetch(...args);
// };
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
// const Request = (...args) =>
//   import("node-fetch").then(({ default: Request }) => Request(...args));

const GRAPHQL_ENDPOINT =
  // process.env.API_ < YOUR_API_NAME > _GRAPHQLAPIENDPOINTOUTPUT;
  "https://qxohgzahbvhytksiegrj4macla.appsync-api.ca-central-1.amazonaws.com/graphql";
const GRAPHQL_API_KEY =
  // process.env.API_ < YOUR_API_NAME > _GRAPHQLAPIKEYOUTPUT;
  "da2-ghgkjvxhr5dgvgz7iopp2of6pm";
const handler = require("./helpers.js");

// const userStreamARN =
//   "arn:aws:dynamodb:ca-central-1:834289487514:table/User-4aq47vftyrf2nmprur3qha4iue-dev/stream/";
// const topicStreamARN =
//   "arn:aws:dynamodb:ca-central-1:834289487514:table/Topic-4aq47vftyrf2nmprur3qha4iue-dev/stream/";

/*****************
 * Testing
 *****************/

// handler.getUserEndpoints("78ea5fbb-8d73-426e-82c0-4a6a3aa64283");
// handler.handleInsertUser('787', '2@mail.com', '1353', 'BC', '6d93h5')
// .then(r => console.log(r));

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);
  return new Promise((resolve, reject) => {
    event.Records.forEach((record) => {
      let payload = record.kinesis;
      console.log("printing the raw payload info ...");
      console.log(payload.partitionKey);
      let data = Buffer.from(payload.data, "base64").toString();

      // try

      return migrateToPinpoint(JSON.parse(data));
      //     .then((response) => {
      //       console.log("migrateToPinpoint response: ");
      //       console.log(response);
      //     })
      //     .catch((err) => {
      //       console.log("migrateToPpt err:", err);
      //       reject(err);
      //     });
      // });

      // resolve("Successfully processed all records");
    });
  });
};

/**
 * migrate changes in record to pinpoint
 * @param {Record} record
 * @return {Promise} a Promise object that contains the ids of the user and/or endpoint changed
 * TODO
 */
async function migrateToPinpoint(record) {
  console.log("record: ", record);
  console.log("data: ", record.data);
  console.log("operation: ", record.metadata.operation);
  let data = record.data;
  let table = record.metadata["table-name"];
  let operation = record.metadata.operation;
  return new Promise((resolve, reject) => {
    switch (table) {
      case "User":
        switch (operation) {
          case "insert":
          case "update":
            handler
              .upsertUserProfile(
                data.user_id.toString(),
                data.province,
                data.postal_code
              )
              .then((response) => {
                console.log("upsertUserProfile response: ", response);
                return handler.upsertEndpoint(
                  data.user_id.toString(),
                  "EMAIL" + "_" + data.user_id.toString(),
                  data.email_address,
                  "EMAIL"
                );
              })
              .then((response) => {
                console.log("upsertEndpoint response: ", response);
                if (data.phone_address) {
                  return handler.upsertEndpoint(
                    data.user_id.toString(),
                    "PHONE" + "_" + data.phone_address.toString(),
                    data.phone_address,
                    "SMS"
                  );
                } else {
                  return "success";
                }
              })
              .then((response) =>
                console.log("second upsertEndpoint response: ", response)
              )
              .catch((err) => {
                console.log("handler err: ", err);
              });
            break;
          case "REMOVE":
            return handler.deleteUser(data.user_id.toString());
            break;
        }
        break;
      case "CategoryTopic":
        switch (operation) {
          case "insert":
            handler
              .createSegment(
                data.category_acronym + "-" + data.topic_acronym,
                "EMAIL"
              )
              .then((response) => {
                console.log("createSegment response: ", response);
                return handler.createSegment(
                  data.category_acronym + "-" + data.topic_acronym,
                  "SMS"
                );
              })
              .then((response) => {
                console.log("second createSegment response: ", response);
                resolve(response);
              })
              .catch((err) => {
                console.log(err);
                reject(err);
              });
            break;
          case "update":
            break;
          case "remove":
            break;
        }
        break;
      case "UserCategoryTopic":
        switch (operation) {
          case "insert":
          case "update":
            executeGraphQL(`
            query MyQuery {
              getCategoryTopicById(categoryTopic_id: ${data.categoryTopic_id}) {
                topic_acronym
                category_acronym
              }
            }`)
              .then((response) => {
                categorytopic = response.data.getCategoryTopicById;
                handler.updateTopicChannel(
                  data.user_id,
                  categorytopic.category_acronym +
                    "-" +
                    categorytopic.topic_acronym,
                  data.email_notice,
                  data.sms_notice
                );
                resolve("pinpoint update channel preference succeeded");
              })
              .catch((err) => reject(err));
            break;
          case "delete":
            break;
        }
        break;
    }
  });
}

/**
 * extract table name from the record
 * @param {Object} record
 * @return {String} the table name, one of 'User' or 'Topic'
 */
// function getTableName(record) {
//   let sourceARN = record.eventSourceARN;
//   if (sourceARN.startsWith(userStreamARN)) {
//     console.log("processing updates from User table");
//     return "User";
//   } else if (sourceARN.startsWith(topicStreamARN)) {
//     console.log("processing updates from Topic table");
//     return "Topic";
//   }
// }

async function executeGraphQL(query, variables) {
  console.log("executing query: ", query);
  return new Promise((resolve, reject) => {
    let options = {
      method: "POST",
      headers: {
        "x-api-key": GRAPHQL_API_KEY,
      },
      body: JSON.stringify({ query, variables }),
    };

    fetch(GRAPHQL_ENDPOINT, options)
      .then((response) => {
        console.log("executeGraphQL response:", response);
        return response.json();
      })
      .then((json) => {
        console.log("executeGraphQL return:", JSON.stringify(json));
        resolve(json);
      })
      .catch((err) => {
        reject(err);
      });
  });
}
