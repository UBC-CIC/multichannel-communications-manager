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
        partitionKey: "partitionKey-03",
        kinesisSchemaVersion: "1.0",
        data: "ewoJImRhdGEiOgl7CgkJInVzZXJfaWQiOgk4LAoJCSJlbWFpbF9hZGRyZXNzIjoJIjJwaW9ydTJAbWFpbC5jb20iLAoJCSJwcm92aW5jZSI6CSJBQiIsCiJwaG9uZV9hZGRyZXNzIjogNDI0NTY3MTA1LAoicGhvbmVfaWQiOiA3LAoicG9zdGFsX2NvZGUiOiAiZndyMzJyIgoJfSwKCSJtZXRhZGF0YSI6CXsKCQkidGltZXN0YW1wIjoJIjIwMjItMTEtMThUMjE6MzU6MTguMzE0OTU5WiIsCgkJInJlY29yZC10eXBlIjoJImRhdGEiLAoJCSJvcGVyYXRpb24iOgkiaW5zZXJ0IiwKCQkicGFydGl0aW9uLWtleS10eXBlIjoJInNjaGVtYS10YWJsZSIsCgkJInNjaGVtYS1uYW1lIjoJInN5cyIsCgkJInRhYmxlLW5hbWUiOgkiVXNlciIsCgkJInRyYW5zYWN0aW9uLWlkIjoJODU4OTkzNjI2MwoJfQp9==",
        sequenceNumber:
          "49545115243490985018280067714973144582180062593244200961",
        approximateArrivalTimestamp: 1428537600,
      },
      eventSource: "aws:kinesis",
      eventID:
        "shardId-000000000000:49545115243490985018280067714973144582180062593244200961",
      invokeIdentityArn: "arn:aws:iam::EXAMPLE",
      eventVersion: "1.0",
      eventName: "aws:kinesis:record",
      eventSourceARN: "arn:aws:kinesis:EXAMPLE",
      awsRegion: "us-east-1",
    },
  ],
};

// index.handler(e);
handler
  .getUserEndpoints("8")
  .then((response) => {
    console.log(response);
  })
  .catch((err) => {
    console.log(err);
  });
