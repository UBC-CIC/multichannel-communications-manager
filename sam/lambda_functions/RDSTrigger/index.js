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
exports.handler = (event) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);
  event.Records.forEach((record) => {
    let payload = record.kinesis;
    console.log("printing the raw payload info ...");
    // console.log(payload);
    // console.log("partitionKey: ");
    console.log(payload.partitionKey);
    // console.log("decoded data: ");
    let data = Buffer.from(payload.data, "base64").toString();
    // console.log(data);

    migrateToPinpoint(JSON.parse(data))
      .then((response) => {
        console.log("migrateToPinpoint response: ");
        console.log(response);
      })
      .catch((err) => {
        console.log(err);
        return Promise.reject(err);
      });
  });
  return Promise.resolve("Successfully processed all records");
};

/**
 * migrate changes in record to pinpoint
 * @param {Record} record
 * @return {Promise} a Promise object that contains the ids of the user and/or endpoint changed
 * TODO
 */
function migrateToPinpoint(record) {
  console.log("record: ", record);
  console.log("data: ", record.data);
  console.log("operation: ", record.metadata.operation);
  let data = record.data;
  let table = record.metadata["table-name"];
  let operation = record.metadata.operation;
  switch (table) {
    case "User":
      switch (operation) {
        case "insert":
        case "modify":
          return handler.upsertUserProfile(
            data.user_id.toString(),
            data.email_address,
            data.phone_address.toString,
            data.province,
            data.postal_code
          );
          handler.upsertUserProfile(
            data.user_id,
            data.province,
            data.postal_code
          );
          handler.upsertEndpoint(
            data.user_id,
            null,
            data.email_address,
            "EMAIL"
          );
          handler.upsertEndpoint(
            data.user_id,
            data.phone_id,
            data.phone_address,
            "SMS"
          );
          break;
        case "REMOVE":
          return handler.deleteUser(data.user_id);
          break;
      }
      break;
  }
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
