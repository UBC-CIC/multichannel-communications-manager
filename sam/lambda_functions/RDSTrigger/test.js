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
        data: "ewoJImRhdGEiOiB7ICJ1c2VyX2lkIjogMTUsICJjYXRlZ29yeVRvcGljX2lkIjogNSwgImVtYWlsX25vdGljZSI6IDEsICJzbXNfbm90aWNlIjogMSB9LAoJIm1ldGFkYXRhIjoJewoJCSJ0aW1lc3RhbXAiOgkiMjAyMi0xMS0yMVQwMTo1MDoxMy4xNDUyNjJaIiwKCQkicmVjb3JkLXR5cGUiOgkiZGF0YSIsCgkJIm9wZXJhdGlvbiI6CSJpbnNlcnQiLAoJCSJwYXJ0aXRpb24ta2V5LXR5cGUiOgkic2NoZW1hLXRhYmxlIiwKCQkic2NoZW1hLW5hbWUiOgkic3lzIiwKCQkidGFibGUtbmFtZSI6CSJVc2VyQ2F0ZWdvcnlUb3BpYyIsCgkJInRyYW5zYWN0aW9uLWlkIjoJODU4OTk0NjY2NwoJfQp9",
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
//   .getUserEndpoints("12")
//   .then((response) => {
//     console.log(JSON.stringify(response));
//   })
//   .catch((err) => {
//     console.log(err);
//   });
