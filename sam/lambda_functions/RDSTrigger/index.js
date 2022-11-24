const gqlRequest = require("graphql-request");
const GRAPHQL_ENDPOINT =
  // process.env.API_ < YOUR_API_NAME > _GRAPHQLAPIENDPOINTOUTPUT;
  "https://qxohgzahbvhytksiegrj4macla.appsync-api.ca-central-1.amazonaws.com/graphql";
const GRAPHQL_API_KEY =
  // process.env.API_ < YOUR_API_NAME > _GRAPHQLAPIKEYOUTPUT;
  "da2-ghgkjvxhr5dgvgz7iopp2of6pm";
const handler = require("./helpers.js");

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event, context) => {
  // try setting the event loop setting
  // console.log("context:", context);
  // console.log("eventLoop var:", context.callbackWaitsForEmptyEventLoop);
  // console.log("eventLoop type:", typeof context.callbackWaitsForEmptyEventLoop);
  // console.log("new context:", context);

  console.log(`EVENT: ${JSON.stringify(event)}`);
  // return new Promise((resolve, reject) => {
  try {
    event.Records.forEach(async (record) => {
      let payload = record.kinesis;
      console.log("printing the raw payload info ...");
      console.log(payload.partitionKey);
      let data = Buffer.from(payload.data, "base64").toString();

      await migrateToPinpoint(JSON.parse(data));
    });
  } catch (err) {
    return err;
  }

  return "successfully processed all records";
  // });
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
  // return new Promise(async (resolve, reject) => {
  switch (table) {
    // commented out these two cases because the problem now is in the last case
    // case "User":
    //   switch (operation) {
    //     case "insert":
    //     case "update":
    //       handler
    //         .upsertUserProfile(
    //           data.user_id.toString(),
    //           data.province,
    //           data.postal_code
    //         )
    //         .then((response) => {
    //           console.log("upsertUserProfile response: ", response);
    //           if (data.email_address) {
    //             return handler.upsertEndpoint(
    //               data.user_id.toString(),
    //               "EMAIL" + "_" + data.user_id.toString(),
    //               data.email_address,
    //               "EMAIL"
    //             );
    //           } else {
    //             return "success";
    //           }
    //         })
    //         .then((response) => {
    //           console.log("upsertEndpoint response: ", response);
    //           if (data.phone_address) {
    //             return handler.upsertEndpoint(
    //               data.user_id.toString(),
    //               "PHONE" + "_" + data.user_id.toString(),
    //               data.phone_address,
    //               "SMS"
    //             );
    //           } else {
    //             return "success";
    //           }
    //         })
    //         .then((response) =>
    //           console.log("second upsertEndpoint response: ", response)
    //         )
    //         .catch((err) => {
    //           console.log("handler err: ", err);
    //         });
    //       break;
    //     case "delete":
    //       return handler.deleteUser(data.user_id.toString());
    //       break;
    //   }
    //   break;
    // case "CategoryTopic":
    //   switch (operation) {
    //     case "insert":
    //       handler
    //         .createSegment(
    //           data.category_acronym + "-" + data.topic_acronym,
    //           "EMAIL"
    //         )
    //         .then((response) => {
    //           console.log("createSegment response: ", response);
    //           return handler.createSegment(
    //             data.category_acronym + "-" + data.topic_acronym,
    //             "SMS"
    //           );
    //         })
    //         .then((response) => {
    //           console.log("second createSegment response: ", response);
    //           resolve(response);
    //         })
    //         .catch((err) => {
    //           console.log(err);
    //           reject(err);
    //         });
    //       break;
    //     case "update":
    //       break;
    //     case "remove":
    //       break;
    //   }
    //   break;
    case "UserCategoryTopic":
      switch (operation) {
        case "insert":
        case "update":
          try {
            let gqlresponse = await executeGraphQL(`
            query MyQuery {
              getCategoryTopicById(categoryTopic_id: ${data.categoryTopic_id}) {
                topic_acronym
                category_acronym
              }
            }`);
            console.log("gqlresponse: ", gqlresponse);
            let categorytopic = gqlresponse.getCategoryTopicById;
            await handler.updateTopicChannel(
              data.user_id,
              categorytopic.category_acronym +
                "-" +
                categorytopic.topic_acronym,
              data.email_notice,
              data.sms_notice
            );
            return "pinpoint update channel preference succeeded";
          } catch (err) {
            console.log("UserCategoryTopic upsert err:", err);
            return err;
          }
          // .then((response) => {
          //   categorytopic = response.getCategoryTopicById;
          //   handler.updateTopicChannel(
          //     data.user_id,
          //     categorytopic.category_acronym +
          //       "-" +
          //       categorytopic.topic_acronym,
          //     data.email_notice,
          //     data.sms_notice
          //   );
          //   resolve("pinpoint update channel preference succeeded");
          // })
          // .catch((err) => reject(err));
          break;
        case "delete":
          executeGraphQL(`
            query MyQuery {
              getCategoryTopicById(categoryTopic_id: ${data.categoryTopic_id}) {
                topic_acronym
                category_acronym
              }
            }`)
            .then((response) => {
              let categorytopic = response.data.getCategoryTopicById;
              handler.updateTopicChannel(
                data.user_id,
                categorytopic.category_acronym +
                  "-" +
                  categorytopic.topic_acronym,
                false,
                false
              );
              return "pinpoint unfollow email and phone succeeded";
            })
            .catch((err) => err);
          break;
      }
      break;
  }
  // });
}

async function executeGraphQL(query) {
  console.log("executing query: ", query);
  return new Promise(async (resolve, reject) => {
    // let options = {
    //   method: "POST",
    //   headers: {
    //     "x-api-key": GRAPHQL_API_KEY,
    //   },
    //   body: JSON.stringify({ query, variables }),
    // };
    let gqlQuery = gqlRequest.gql([query]);
    console.log("214");
    const gqlClient = new gqlRequest.GraphQLClient(GRAPHQL_ENDPOINT, {
      headers: {
        "x-api-key": GRAPHQL_API_KEY,
      },
    });
    console.log("220");
    // try {
    // let response = await
    try {
      // my lambda function doesn't wait for this call to finish. It just ends immediately without printing either result or error
      let result = await gqlClient.request(gqlQuery);
      console.log("gql request response: ", result);
      resolve(result);
    } catch (err) {
      console.log("gql request err:", err);
      reject(err);
    }
    // .then((response) => {
    //   console.log("gql return:", JSON.stringify(response));
    //   resolve(reponse);
    // })
    // .catch((err) => {
    //   reject(err);
    // });
    // console.log("return??");
    // console.log(response);
    // resolve(response);)

    // } catch (err) {
    //   console.log("gql err: ", err);
    //   return err;
    // }
  });
}
