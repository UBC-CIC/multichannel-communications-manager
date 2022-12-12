// import {
//   getAllCategories,
//   getCategoryByAcronym,
//   getTopicByAcronym,
// } from "../../graphql/queries";
// const API = require("aws-amplify").API;
const graphqlOperation = require("aws-amplify").graphqlOperation;

const getCategoryByAcronym = /* GraphQL */ `
  query GetCategoryByAcronym($acronym: String!) {
    getCategoryByAcronym(acronym: $acronym) {
      category_id
      acronym
      title
      description
      picture_location
    }
  }
`;
const getTopicByAcronym = /* GraphQL */ `
  query GetTopicByAcronym($topic_acronym: String!) {
    getTopicByAcronym(topic_acronym: $topic_acronym) {
      topic_id
      acronym
    }
  }
`;

const { SES } = require("aws-sdk");
const ses = new SES();
const SES_FROM_ADDRESS = "mminting@mail.ubc.ca";

const allSelectedTopics = [
  { category_title: "BUS", topic_title: ["Funding"] },
  { category_title: "HC", topic_title: ["COVID-19"] },
  { category_title: "Politics", topic_title: ["Business"] },
  { category_title: "Politics", topic_title: ["Elections"] },
];

// async function nextClicked() {
//   const allSelectedTopicsTemp = allSelectedTopics;
//   const succeededTopics = [];
//   console.log("allSelectedTopics: ", allSelectedTopics);
//   for (var i = 0; i < allSelectedTopicsTemp.length; i++) {
//     console.log(allSelectedTopicsTemp[i]);
//     // await API.graphql(
//     //   graphqlOperation(userFollowCategoryTopic, allSelectedTopicsTemp[i])
//     // );
//     let category_info = await API.graphql(
//       graphqlOperation(getCategoryByAcronym, {
//         acronym: allSelectedTopicsTemp[i].category_acronym,
//       })
//     );
//     let topic_info = await API.graphql(
//       graphqlOperation(getTopicByAcronym, {
//         topic_acronym: allSelectedTopicsTemp[i].topic_acronym,
//       })
//     );
//     succeededTopics.push({
//       category_title: category_info.category_title,
//       topic_title: topic_info.topic_acronym,
//     });
//     console.log("succeeded topics: ", succeededTopics);
//   }
//   sendEmail(allSelectedTopicsTemp.user_id, succeededTopics);
//   handleNextStep();
// }

async function sendEmail(emailAddress, categoryTopics) {
  // https://stackoverflow.com/questions/69035085/aggregate-array-of-objects-by-specific-key-and-sum
  const categoryTopicsTree = categoryTopics.reduce((dic, value) => {
    if (!dic[value.category_title]) {
      dic[value.category_title] = value;
    } else {
      let old = dic[value.category_title];
      Object.keys(old).forEach((key) => {
        if (key != "category_title") {
          // if (typeof old[key].push === "function") {
          old[key] = old[key].concat(value[key]);
          // } else {
          //   old[key] = [old[key]].concat([value[key]]);
          //   console.log(old[key]);
          // }
        }
      });
    }
    return dic;
  }, {});

  console.log("categoryTopicsTree:", categoryTopicsTree);
  let categoryTopicsHTML = ``;
  for (let c in categoryTopicsTree) {
    console.log("c:", c);
    categoryTopicsHTML += `${c}`;
    categoryTopicsHTML += `<ul>`;
    for (t of categoryTopicsTree[c].topic_title) {
      // console.log("t:", t);
      categoryTopicsHTML += `<li>${t}</li>`;
    }
    categoryTopicsHTML += `<ul>`;
  }
  // console.log("html:", categoryTopicsHTML);
  const params = {
    Destination: { ToAddresses: [emailAddress] },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: `<html><body><p>You are now subscribed to the following categories and topics:</p>
              ${categoryTopicsHTML}</body></html>`,
        },
        // Text: {
        //   Charset: "UTF-8",
        //   Data: `Your secret login code: ${secretLoginCode}`,
        // },
      },
      Subject: {
        Charset: "UTF-8",
        Data: "Your secret login code",
      },
    },
    Source: SES_FROM_ADDRESS,
  };
  await ses.sendEmail(params).promise();
}

sendEmail("mminting@mail.ubc.ca", allSelectedTopics);
