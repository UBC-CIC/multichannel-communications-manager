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
        partitionKey: "sys.User",
        sequenceNumber:
          "49635282510291549795472904832465031055947861467777204226",
        data: "ewoJImRhdGEiOgl7CgkJInVzZXJfaWQiOgkxMSwKCQkiZW1haWxfYWRkcmVzcyI6CSJtbWludGluZ0BtYWlsLnViYy5jYSIsCgkJInByb3ZpbmNlIjoJIkJDIgoJfSwKCSJtZXRhZGF0YSI6CXsKCQkidGltZXN0YW1wIjoJIjIwMjItMTEtMjBUMjE6NTY6MzIuNTE1NTQ5WiIsCgkJInJlY29yZC10eXBlIjoJImRhdGEiLAoJCSJvcGVyYXRpb24iOgkiaW5zZXJ0IiwKCQkicGFydGl0aW9uLWtleS10eXBlIjoJInNjaGVtYS10YWJsZSIsCgkJInNjaGVtYS1uYW1lIjoJInN5cyIsCgkJInRhYmxlLW5hbWUiOgkiVXNlciIsCgkJInRyYW5zYWN0aW9uLWlkIjoJODU4OTk0MzU2NQoJfQp9",
        approximateArrivalTimestamp: 1668981392.555,
      },
      eventSource: "aws:kinesis",
      eventVersion: "1.0",
      eventID:
        "shardId-000000000000:49635282510291549795472904832465031055947861467777204226",
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
//   .getUserEndpoints("8")
//   .then((response) => {
//     console.log(JSON.stringify(response));
//   })
//   .catch((err) => {
//     console.log(err);
//   });
