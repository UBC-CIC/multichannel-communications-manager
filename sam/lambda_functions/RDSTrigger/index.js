const handler = require("./helpers.js");
const processor = require("dynamodb-streams-processor");
const userStreamARN =
  "arn:aws:dynamodb:ca-central-1:834289487514:table/User-4aq47vftyrf2nmprur3qha4iue-dev/stream/";
const topicStreamARN =
  "arn:aws:dynamodb:ca-central-1:834289487514:table/Topic-4aq47vftyrf2nmprur3qha4iue-dev/stream/";

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
  processor(event.Records).forEach((record) => {
    console.log("printing the record info ...");
    console.log(record);
    migrateToPinpoint(record)
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
  let row = record.dynamodb.NewImage;
  switch (getTableName(record)) {
    case "User":
      switch (record.eventName) {
        case "INSERT":
          return handler.handleInsertUser(
            row.id,
            row.email,
            row.phoneAddress,
            row.province,
            row.postalCode
          );
          break;
        case "MODIFY":
          break;
        case "REMOVE":
          break;
      }
      break;
    case "Topic":
      switch (record.eventName) {
        case "INSERT":
          break;
        case "MODIFY":
          break;
        case "REMOVE":
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
function getTableName(record) {
  let sourceARN = record.eventSourceARN;
  if (sourceARN.startsWith(userStreamARN)) {
    console.log("processing updates from User table");
    return "User";
  } else if (sourceARN.startsWith(topicStreamARN)) {
    console.log("processing updates from Topic table");
    return "Topic";
  }
}
