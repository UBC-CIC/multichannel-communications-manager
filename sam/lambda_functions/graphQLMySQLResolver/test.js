let request = {
  ApplicationId: "a39c6412c79a4ec2946257bb4c95ca2a",
  EndpointId: "22",
  EndpointRequest: {
    User: {
      UserAttributes: {
        province: ["MB"],
        postalCode: ["n3bo9a"],
      },
    },
  },
};

pinpoint.updateEndpoint(request, function (err, response) {
  if (err) {
    console.log("ppt.updateEndpoint err:");
    console.log(err, err.stack);
    reject(err);
  } else {
    console.log("ppt.updateEndpoint response:");
    console.log(response);
    resolve(response);
  }
});
