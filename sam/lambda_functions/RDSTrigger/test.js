const index = require("./index.js");
const handler = require("./helpers.js");
const PINPOINTID = "a39c6412c79a4ec2946257bb4c95ca2a";
const AWS = require("aws-sdk");
// const pinpoint = new AWS.Pinpoint({ region: process.env.REGION });
const pinpoint = new AWS.Pinpoint({ region: "ca-central-1" });

let e = {
  Records: [
    {
      kinesis: {
        kinesisSchemaVersion: "1.0",
        partitionKey: "sys.UserCategoryTopic",
        sequenceNumber:
          "49635282510291549795473114249239761006638651079131136002",
        data: "ewoJImRhdGEiOgl7CgkJInVzZXJfaWQiOgkxNSwKCQkiY2F0ZWdvcnlUb3BpY19pZCI6CTEyLAoJCSJlbWFpbF9ub3RpY2UiOgkwLAoJCSJzbXNfbm90aWNlIjoJMQoJfSwKCSJtZXRhZGF0YSI6CXsKCQkidGltZXN0YW1wIjoJIjIwMjItMTEtMjRUMTk6Mjk6NTYuODI0NzE4WiIsCgkJInJlY29yZC10eXBlIjoJImRhdGEiLAoJCSJvcGVyYXRpb24iOgkidXBkYXRlIiwKCQkicGFydGl0aW9uLWtleS10eXBlIjoJInNjaGVtYS10YWJsZSIsCgkJInNjaGVtYS1uYW1lIjoJInN5cyIsCgkJInRhYmxlLW5hbWUiOgkiVXNlckNhdGVnb3J5VG9waWMiLAoJCSJ0cmFuc2FjdGlvbi1pZCI6CTEyODg0OTE0Njk3Cgl9Cn0=",
        approximateArrivalTimestamp: 1669318196.857,
      },
      eventSource: "aws:kinesis",
      eventVersion: "1.0",
      eventID:
        "shardId-000000000000:49635282510291549795473114249239761006638651079131136002",
      eventName: "aws:kinesis:record",
      invokeIdentityArn: "arn:aws:iam::834289487514:role/RDSHelperLambdaRole",
      awsRegion: "ca-central-1",
      eventSourceARN:
        "arn:aws:kinesis:ca-central-1:834289487514:stream/rdsStream",
    },
  ],
};

index.handler(e);
// handler
//   .getUserEndpoints("12")
//   .then((response) => {
//     console.log(JSON.stringify(response));
//   })
//   .catch((err) => {
//     console.log(err);
//   });
