const PINPOINTID = process.env.PINPOINT_APPID;
const AWS = require("aws-sdk");
const pinpoint = new AWS.Pinpoint({ region: process.env.AWS_REGION });

/*****************
 * Helpers
 *****************/
/**
 * get all the active endpoints of a user
 * @param  {Int} userID The User.UserID to retrieve
 * @return {Promise} A Promise object that contatins a collection of user endpoints
 */
function getUserEndpoints(userID) {
  console.log("getUserEndpoints...");
  return new Promise((resolve, reject) => {
    var params = {
      ApplicationId: PINPOINTID,
      UserId: userID,
    };

    // console.trace(params);
    pinpoint.getUserEndpoints(params, function (err, data) {
      if (err) {
        console.error(err, err.stack);
        reject(err);
      } else {
        // console.debug(data.EndpointsResponse.Item);

        //Strip off INACTIVE
        var filteredEndpoints = data.EndpointsResponse.Item.filter(
          (endpoint) => endpoint.EndpointStatus !== "INACTIVE"
        );
        console.log("getUserEndpoints return: ");
        console.log(JSON.stringify(filteredEndpoints));

        resolve(filteredEndpoints);
      }
    });
  });
}

/**
 * upsert an endpoint to an existing user
 * @param  {String} userID The id of the user, required
 * @param  {String} endpointID The id of the endpoint to upsert, required
 * @param  {String} endpoint_address The address of the endpoint to upsert, required
 * @param  {String} endpoint_type The type the endpoint eg. SMS or EMAIL, required
 * @return {Promise} A Promise object that contains the ids of the user and endpoint that was updated
 */
function upsertEndpoint(userID, endpointID, endpoint_address, endpoint_type) {
  console.log("upsertEndpoint...");
  return new Promise((resolve, reject) => {
    var request = {
      ApplicationId: PINPOINTID,
      EndpointId: endpointID,
      EndpointRequest: {
        Address: endpoint_address,
        ChannelType: endpoint_type,
        User: {
          UserId: userID,
        },
      },
    };

    console.log(
      "sending request to pinpoint ...",
      JSON.stringify(request, null, 2)
    );

    // changedAccount = {
    //   userId: params.User.UserId,
    //   EndpointId: endpointID,
    // };

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
  });
}

/**
 * Upsert a user profile
 * @param {String} userID required
 * @param {String} province
 * @param {String} postalCode
 * @return {Promise} a promise containing the accounts changed
 */
async function upsertUserProfile(userID, province, postalCode) {
  console.log("upsertUserProfile ...");
  return new Promise((resolve, reject) => {
    console.log(userID);
    let request = {
      ApplicationId: PINPOINTID,
      EndpointId: "email" + "_" + userID,
      EndpointRequest: {
        // User: {
        //   UserAttributes: {},
        // },
      },
    };

    let userProfileRequest = { User: { UserAttributes: {} } };

    if (province) {
      userProfileRequest.User.UserAttributes.province = [province];
    }
    if (postalCode) {
      userProfileRequest.User.UserAttributes.postalCode = [postalCode];
    }

    if (province || postalCode) {
      request.EndpointRequest = userProfileRequest;
    }

    console.log(
      "sending request to pinpoint ...",
      JSON.stringify(request, null, 2)
    );

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
  });
}

/**
 * delete all endpoints of a user
 * @param {String} userID
 * @return {Promise} A Promise object that contains information about deleted endpoints
 */
function deleteUser(userID) {
  return new Promise((resolve, reject) => {
    let request = { ApplicationId: PINPOINTID, UserId: userID };

    console.log("sending request to ppt: ", request);
    pinpoint.deleteUserEndpoints(request, function (err, response) {
      if (err) {
        console.error(err, err.stack);
        reject(err);
      } else {
        console.log("deleteUser return: ");
        console.debug(JSON.stringify(response));
        resolve(response);
      }
    });
  });
}

/**
 * create a segment for given categoryTopic and notification type
 * @param {Int} categoryTopicID
 * @param {String} notifType can be one of 'EMAIL' or 'SMS'
 */
function createSegment(categoryTopicID, notifType) {
  return new Promise((resolve, reject) => {
    var templateSegment = {
      Name: `${categoryTopicID}_${notifType}`,
      SegmentGroups: {
        Groups: [
          {
            Dimensions: [
              {
                Demographic: {
                  Channel: {
                    DimensionType: "INCLUSIVE",
                    Values: [notifType],
                  },
                },
              },
              {
                UserAttributes: {},
              },
            ],
          },
        ],
        Include: "ALL",
      },
    };

    templateSegment.SegmentGroups.Groups[0].Dimensions[1].UserAttributes[
      categoryTopicID
    ] = {
      AttributeType: "CONTAINS",
      Values: [notifType],
    };

    console.log(templateSegment);

    var params = {
      ApplicationId: PINPOINTID,
      WriteSegmentRequest: templateSegment,
    };

    pinpoint.createSegment(params, function (err, data) {
      if (err) {
        console.log("createSegmentFailure", err);
        reject(err);
      } else {
        console.log("createSegmentSuccess", data);
        resolve(data);
      }
    });
  });
}

/**
 * update the channels through which a user wants to receive notificaiton about a topic
 * @param {Int} userID
 * @param {Int} categoryTopicName
 * @param {Boolean} emailNotice
 * @param {Boolean} textNotice
 * @return {Promise} a promise that contains the user and endpoint id changed
 */
function updateTopicChannel(
  userID,
  categoryTopicName,
  emailNotice,
  textNotice
) {
  userID = userID.toString();
  let emailID = userID;

  let request = {
    ApplicationId: PINPOINTID,
    EndpointId: "email" + "_" + emailID,
    EndpointRequest: {
      OptOut: "NONE",
      User: {
        UserAttributes: { [categoryTopicName]: [] },
      },
    },
  };

  if (emailNotice) {
    request.EndpointRequest.User.UserAttributes[categoryTopicName].push(
      "EMAIL"
    );
  }

  if (textNotice) {
    request.EndpointRequest.User.UserAttributes[categoryTopicName].push("SMS");
  }

  console.log(
    "sending request to pinpoint ...",
    JSON.stringify(request, null, 2)
  );

  return new Promise((resolve, reject) => {
    pinpoint.updateEndpoint(request, function (err, response) {
      if (err) {
        console.log("pinpoint.updateEndpoint err:");
        console.log(err, err.stack);
        reject(err);
      } else {
        console.log("pinpoint.updateEndpoint response:");
        console.log(response);
        resolve(response);
      }
    });
  });
}

/**
 * remove attribute topicID from all users
 * NOT WORKING because of pinpoint bug: https://github.com/aws/aws-sdk-js/issues/3180
 * @param {String} topicID
 */
function deleteTopic(topicID) {
  let request = {
    ApplicationId: PINPOINTID,
    AttributeType: "endpoint-user-attributes",
    UpdateAttributesRequest: {
      Blacklist: [topicID],
    },
  };

  return new Promise((resolve, reject) => {
    console.log(request);

    pinpoint.removeAttributes(request, function (err, data) {
      if (err) {
        reject(err);
        console.error(err, err.stack);
      } else {
        console.log("pinpoint.updateEndpoint return: ");
        console.debug(data);
        resolve(data);
      }
    });
  });
}

module.exports = {
  getUserEndpoints,
  upsertEndpoint,
  upsertUserProfile,
  deleteUser,
  updateTopicChannel,
};
