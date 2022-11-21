// const { v4: uuidv4 } = require("uuid");
// const PINPOINTID = process.env.PINPOINT_APPID;
const PINPOINTID = "a39c6412c79a4ec2946257bb4c95ca2a";
const AWS = require("aws-sdk");
// const pinpoint = new AWS.Pinpoint({ region: process.env.REGION });
const pinpoint = new AWS.Pinpoint({ region: "ca-central-1" });

/*****************
 * Testing
 *****************/

// upsertUserEndpoint("7", '7', {
//   Address: "777@gmail.com",
//   ChannelType: "EMAIL",
// });
// deleteUser('2');
// getUserEndpoints("78ea5fbb-8d73-426e-82c0-4a6a3aa64283");
// createSegment('topic1', 'SMS');
// pinpoint.getSegment({ApplicationId: PINPOINTID, SegmentId: '1063bf68f7334998a6d71bae94ae2f54'},
// function(err, data){
//   console.log(data);
// });
// updateTopicChannel('7', 'topic4', true, true);
// deleteTopic('topic4');

/*****************
 * Helpers
 *****************/
/**
 * get all the endpoints of a user
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
 * @param  {String} endpointID The id of the email/phone endpoint to modify, required
 * @param  {String} endpoint_address The address of the endpoint to upsert, required
 * @param  {String} endpoint_type The type the endpoint eg. SMS or EMAIL, required
 * @return {Promise} A Promise object that contains the ids of the user and endpoint that was updated
 */
function upsertEndpoint(userID, endpointID, endpoint_address, endpoint_type) {
  console.log("upsertEndpoint...");
  return new Promise((resolve, reject) => {
    var request = {
      ApplicationId: PINPOINTID,
      EndpointId: endpoint_type === "EMAIL" ? userID : endpointID,
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

    // console.log('about to call updateEndpoint ...');

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
 * format the upsert request and call upsertUserEndpoint()
 * @param {Int} userID
 * @param {String} emailAdress
 * @param {Int} phoneAddress
 * @param {String} province
 * @param {String} postalCode
 * @return {Promise} a promise containing the accounts changed
 */
async function upsertUserProfile(userID, province, postalCode) {
  console.log("upsertUserProfile ...");
  return new Promise((resolve, reject) => {
    //   upsertUserEndpoint(userID, userID, {
    //     Address: emailAdress,
    //     ChannelType: "EMAIL",
    //     User: {
    //       UserAttributes: {
    //         province: [province],
    //         postalCode: [postalCode],
    //       },
    //     },
    //   })
    //     .then((accountsChanged) => {
    //       if (phoneAddress === undefined) {
    //         resolve(accountsChanged);
    //       } else {
    //         upsertUserEndpoint(userID, null, {
    //           Address: phoneAddress,
    //           ChannelType: "SMS",
    //         })
    //           .then((accountsChanged2) => {
    //             resolve([accountsChanged, accountsChanged2]);
    //           })
    //           .catch((err) => {
    //             reject(err);
    //           });
    //       }
    //     })
    //     .catch((error) => {
    //       reject(error);
    //     });
    // });

    let request = {
      ApplicationId: PINPOINTID,
      EndpointId: userID,
      EndpointRequest: {
        User: {
          UserAttributes: {
            province: [province],
            postalCode: [postalCode],
          },
        },
      },
    };

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
 * @param {Int} userID
 * @return {Promise} A Promise object that contains information about deleted endpoints
 */
function deleteUser(userID) {
  return new Promise((resolve, reject) => {
    let request = { ApplicationId: PINPOINTID, UserId: userID };

    pinpoint.deleteUserEndpoints(request, function (err, response) {
      if (err) {
        console.error(err, err.stack);
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
  /*
    let request = {
        ApplicationId: PINPOINTID,
        WriteSegmentRequest: {
            Name: topicID + '_' + notifType,
            Dimensions: [
                {
                  UserAttributes: {
                    [topicID]: {
                        DimensionType: 'INCLUSIVE',
                        Values: [notifType]
                    }
                  }
                }
              ]
        }
    }
  */

  // let templateSegment = {
  //   Name: `${topicID}_${notifType}`,
  //   Dimensions: {
  //       UserAttributes: {
  //         [topicID]: {
  //           AttributeType: "INCLUSIVE",
  //           Values: [notifType],
  //         },
  //       },
  //       Demographic: {
  //         Channel: {
  //           DimensionType: "INCLUSIVE",
  //           Values: [notifType],
  //         },
  //       },
  //   },
  //   SegmentGroups: {
  //     Include: "ALL"
  //   },
  // };

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

  let params = {
    User: {
      UserAttributes: {
        [categoryTopicName]: [],
      },
    },
  };

  let request = {
    ApplicationId: PINPOINTID,
    EndpointId: userID,
    EndpointRequest: {
      OptOut: "NONE",
      User: {
        UserAttributes: { [categoryTopicName]: [] },
      },
    },
  };

  if (emailNotice === 1) {
    request.EndpointRequest.User.UserAttributes[categoryTopicName].push(
      "EMAIL"
    );
  }

  if (textNotice === 1) {
    request.EndpointRequest.User.UserAttributes[categoryTopicName].push("SMS");
  }

  // return upsertEndpoint(userID, emailID, params);
  console.log(
    "sending request to pinpoint ...",
    JSON.stringify(request, null, 2)
  );

  return new Promise((resolve, reject) => {
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
 * remove attribute topicID from all users
 * NOT WORKING cuz of pinpoint bug
 * @param {Int} topicID
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
  createSegment,
  updateTopicChannel,
};
