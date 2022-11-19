const { v4: uuidv4 } = require("uuid");
const PINPOINTID = "31842758bdd442c18dc6176db7912f57";
const AWS = require("aws-sdk");
const pinpoint = new AWS.Pinpoint({ region: "ca-central-1" });
// const pinpoint = new AWS.Pinpoint({ region: process.env.REGION });

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
 * @param  {String} userID The User.UserID to retrieve
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
        // console.log(data.EndpointsResponse.Item);

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
 * upsert a user or one of its endpoints
 * @param  {String} userID cannot be null
 * @param  {String} endpointID The id of the email/phone endpoint to modify
 * @param  {Object} params The params for the upsert, format see https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-pinpoint/interfaces/endpointrequest.html
 * @return {Promise} A Promise object that contains the ids of the user and endpoint that was updated
 */
function upsertUserEndpoint(userID, endpointID, params) {
  console.log("upsertUserEndpoint...");
  return new Promise((resolve, reject) => {
    // // if provided null values for endpointID, generate id
    // if (userID == null) {
    //   reject("userID cannot be null");
    // } else {
    //   endpointID == null ? (endpointID = uuidv4()) : endpointID;
    // }

    // insert provided userID into request body
    if (params.User == undefined) {
      params.User = { UserId: userID };
    } else if (params.User.UserId != userID) {
      params.User.UserId = userID;
    }

    //Remove following attributes...they were part of Get, but the Update doesn't like them
    delete params.ApplicationId;
    delete params.CohortId;
    delete params.CreationDate;
    delete params.Id;

    var request = {
      ApplicationId: PINPOINTID,
      EndpointId: endpointID,
      EndpointRequest: params,
    };

    console.log(JSON.stringify(request, null, 2));

    // console.log('about to call updateEndpoint ...');

    pinpoint.updateEndpoint(request, function (err, data) {
      if (err) {
        console.error(err, err.stack);
        reject(err);
      } else {
        changedAccount = {
          userId: params.User.UserId,
          EndpointId: endpointID,
        };
        console.log("pinpoint.updateEndpoint return: ");
        console.log(changedAccount);
        resolve(changedAccount);
      }
    });
  });
}

/**
 * format the upsert request and call upsertUserEndpoint()
 * @param {String} userID
 * @param {String} emailAdress
 * @param {String} phoneAddress
 * @param {String} province
 * @param {String} postalCode
 * @return {Promise} a promise containing the accounts changed
 */
function upsertUserProfile(
  userID,
  emailAdress,
  phoneAddress,
  province,
  postalCode
) {
  return new Promise((resolve, reject) => {
    upsertUserEndpoint(userID, userID, {
      Address: emailAdress,
      ChannelType: "EMAIL",
      User: {
        UserAttributes: {
          province: [province],
          postalCode: [postalCode],
        },
      },
    })
      .then((accountsChanged) => {
        if (phoneAddress === undefined) {
          resolve(accountsChanged);
        } else {
          upsertUserEndpoint(userID, null, {
            Address: phoneAddress,
            ChannelType: "SMS",
          })
            .then((accountsChanged2) => {
              resolve([accountsChanged, accountsChanged2]);
            })
            .catch((err) => {
              reject(err);
            });
        }
      })
      .catch((error) => {
        reject(error);
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

    pinpoint.deleteUserEndpoints(request, function (err, response) {
      if (err) {
        console.error(err, err.stack);
      } else {
        console.log("deleteUser return: ");
        console.log(JSON.stringify(response));
        resolve(response);
      }
    });
  });
}

/**
 * create a segment for given categoryTopic and notification type
 * @param {String} categoryTopicID
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
 * @param {String} userID
 * @param {String} categoryTopicID
 * @param {Boolean} emailNotice
 * @param {Boolean} textNotice
 * @return {Promise} a promise that contains the user and endpoint id changed
 */
function updateTopicChannel(userID, categoryTopicID, emailNotice, textNotice) {
  let emailID = userID;

  // let request = {
  //   ApplicationId: PINPOINTID,
  //   endpointID: emailID,

  // }

  // pinpoint.updateEndpoint(request, function(err, data){

  // })

  let params = {
    User: {
      UserAttributes: {
        [categoryTopicID]: [],
      },
    },
  };

  if (emailNotice === true) {
    params.User.UserAttributes[categoryTopicID].push("EMAIL");
  }

  if (textNotice === true) {
    params.User.UserAttributes[categoryTopicID].push("SMS");
  }

  return upsertUserEndpoint(userID, emailID, params);
}

/**
 * remove attribute topicID from all users
 * NOT WORKING cuz of pinpoint bug
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
        console.log(data);
        resolve(data);
      }
    });
  });
}

module.exports = {
  getUserEndpoints,
  upsertUserEndpoint,
  handleInsertUser: upsertUserProfile,
  deleteUser,
  createSegment,
  updateTopicChannel,
};
