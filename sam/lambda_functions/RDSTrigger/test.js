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
        data: "ewoJImRhdGEiOgl7CgkJInVzZXJfaWQiOgk4LAoJCSJjYXRlZ29yeVRvcGljX2lkIjoJMywKCQkiZW1haWxfbm90aWNlIjoJMCwKCQkic21zX25vdGljZSI6CTAKCX0sCgkibWV0YWRhdGEiOgl7CgkJInRpbWVzdGFtcCI6CSIyMDIyLTExLTIwVDA2OjUzOjAzLjk2NjQxOFoiLAoJCSJyZWNvcmQtdHlwZSI6CSJkYXRhIiwKCQkib3BlcmF0aW9uIjoJImluc2VydCIsCgkJInBhcnRpdGlvbi1rZXktdHlwZSI6CSJzY2hlbWEtdGFibGUiLAoJCSJzY2hlbWEtbmFtZSI6CSJzeXMiLAoJCSJ0YWJsZS1uYW1lIjoJIlVzZXJDYXRlZ29yeVRvcGljIiwKCQkidHJhbnNhY3Rpb24taWQiOgk4NTg5OTM4NzczCgl9Cn0=",
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
    console.log(JSON.stringify(response));
  })
  .catch((err) => {
    console.log(err);
  });
