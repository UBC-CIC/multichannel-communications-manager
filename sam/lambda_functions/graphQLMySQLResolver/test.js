let request = {
  ApplicationId: "4dd4f0be4a904c169c3cba73530a3f11",
  EndpointId: "1",
  EndpointRequest: {
    OptOut: "NONE",
    User: {
      UserAttributes: {
        "EDU-college": [],
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
