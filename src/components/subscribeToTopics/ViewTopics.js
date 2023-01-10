import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardHeader,
  CardMedia,
  CardActions,
  CardContent,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Alert,
  Collapse,
} from "@mui/material";
import { imageListItemClasses } from "@mui/material/ImageListItem";
import { Auth, API, graphqlOperation, Storage, I18n } from "aws-amplify";
import {
  getAllCategoriesForLanguage,
  getUserCategoryTopicByUserId,
  getUserByEmail,
  getTopicsOfCategory,
  getCategoriesByUserId,
} from "../../graphql/queries";
import {
  userUnfollowCategoryTopic,
  userFollowCategoryTopic,
  userUnfollowCategory,
} from "../../graphql/mutations";

const ViewTopics = () => {
  const [alert, setAlert] = useState(false);
  // all topics on the page
  // category_id
  // title
  // description
  // picture_location
  const [topics, setTopics] = useState([]);
  // all subtopics (on the page)
  // acronym string -> obj
  const [subtopics, setSubtopics] = useState([]);
  // userSubscription relationships, set once
  // user_id
  // category_acronym
  // topic_acronym
  // email_notice
  // sms_notice
  const [userSubscribed, setUserSubscribed] = useState([]);
  const [image, setImage] = useState([]);
  //
  // acronym string
  const [selectedSubTopics, setSelectedSubtopics] = useState([]);
  // for categories that user is not subscribed to, if its topics are checked by the user
  // acronym string
  const [selectedSubTopicsCheckbox, setSelectedSubtopicsCheckbox] = useState(
    []
  );
  // for categories that user is subscribed to, if its topics are checked by the user
  // acronym string
  const [userSelectedSubTopics, setUserSelectedSubtopics] = useState([]);
  // acronym string
  const [userSelectedSubTopicsTemp, setUserSelectedSubtopicsTemp] = useState(
    []
  );
  // acronym string
  const [userUnfollow, setUserUnfollow] = useState([]);
  const [userID, setUserID] = useState("");
  // if user already subscribed to the topic on the page at corresponding index
  // bool
  const [userAlreadySubscribed, setUserAlreadySubscribed] = useState([]);
  const [user, setUser] = useState();
  const [language, setLanguage] = useState(
    navigator.language === "fr" || navigator.language.startsWith("fr-")
      ? "fr"
      : "en"
  );

  async function getCategoryImages(categories) {
    for (let i = 0; i < categories.length; i++) {
      let imageURL = await Storage.get(categories[i].picture_location);
      setImage((prev) => [...prev, imageURL]);
    }
  }

  async function queriedData() {
    console.log("in querieddata");
    let categories = await API.graphql(
      graphqlOperation(getAllCategoriesForLanguage, { language: language })
    );
    let allCategories = categories.data.getAllCategoriesForLanguage;
    setTopics(allCategories);
    getCategoryImages(allCategories);
    getTopics(allCategories);
    getUserSubscriptions(allCategories);
  }

  async function getTopics(allCategories) {
    for (let i = 0; i < allCategories.length; i++) {
      let queriedTopics = await API.graphql(
        graphqlOperation(getTopicsOfCategory, {
          category_id: allCategories[i].category_id,
          language: language,
        })
      );
      let onlyTopics = queriedTopics.data.getTopicsOfCategory;

      // let topics = onlyTopics.map((a) => a.acronym);
      setSubtopics((subtopics) => [...subtopics, onlyTopics]);
    }
  }

  // get only the categories and topics the user is subscribed to
  async function getOnlyUserSubscribedData() {
    const returnedUser = await Auth.currentAuthenticatedUser();
    let getUserId = await API.graphql(
      graphqlOperation(getUserByEmail, {
        user_email: returnedUser.attributes.email,
      })
    );
    let categories = await API.graphql(
      graphqlOperation(getCategoriesByUserId, {
        user_id: getUserId.data.getUserByEmail.user_id,
        language: language,
      })
    );
    let noDuplicates = categories.data.getCategoriesByUserId.filter(
      (value, index, self) =>
        index === self.findIndex((t) => t.category_id === value.category_id)
    );
    setTopics(noDuplicates);
    getCategoryImages(noDuplicates);
    getTopics(noDuplicates);
    getUserSubscriptions(noDuplicates);
  }

  // get all the topics the user is subscribed to
  async function getUserSubscriptions(allCategories) {
    const returnedUser = await Auth.currentAuthenticatedUser();
    let getUserId = await API.graphql(
      graphqlOperation(getUserByEmail, {
        user_email: returnedUser.attributes.email,
      })
    );
    let userCategories = await API.graphql(
      graphqlOperation(getUserCategoryTopicByUserId, {
        user_id: getUserId.data.getUserByEmail.user_id,
      })
    );
    setUserID(getUserId.data.getUserByEmail.user_id);
    setUser(getUserId.data.getUserByEmail);
    let userSubscribedSubtopics =
      userCategories.data.getUserCategoryTopicByUserId;
    setUserSubscribed(userSubscribedSubtopics);

    for (let x = 0; x < allCategories.length; x++) {
      let filteredUserSubscribedSubtopics = userSubscribedSubtopics.filter(
        (s) => s.category_id === allCategories[x].category_id
      );
      if (filteredUserSubscribedSubtopics.length !== 0) {
        for (let i = 0; i < filteredUserSubscribedSubtopics.length; i++) {
          setUserSelectedSubtopics((prev) => [
            ...prev,
            filteredUserSubscribedSubtopics[i].topic_id,
          ]);
        }
        setUserAlreadySubscribed((prev) => [...prev, true]);
      } else {
        setUserAlreadySubscribed((prev) => [...prev, false]);
      }
    }
  }

  useEffect(() => {
    queriedData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e, subtopic) => {
    console.log("in handlechange");
    if (e.target.checked) {
      console.log("checked");
      setSelectedSubtopics((prev) => [...prev, subtopic]);
      setSelectedSubtopicsCheckbox((prev) => {
        console.log("prev", prev);
        console.log("subtopic", subtopic);
        console.log("[...prev, subtopic]", [...prev, subtopic]);

        return [...prev, subtopic];
      });
      console.log("selectedSubTopicsCheckbox", selectedSubTopicsCheckbox);
    } else if (!e.target.checked) {
      console.log("not checked");
      setSelectedSubtopics((prev) => prev.filter((s) => s !== subtopic));
      setSelectedSubtopicsCheckbox((prev) =>
        prev.filter((s) => s !== subtopic)
      );
      // console.log("selectedSubTopicsCheckbox", selectedSubTopicsCheckbox);
    }
  };

  const handleAlreadySubscribedChange = (e, subtopic) => {
    if (e.target.checked) {
      setUserSelectedSubtopics((prev) => [...prev, subtopic]);
      setUserSelectedSubtopicsTemp((prev) => [...prev, subtopic]);
      setUserUnfollow((prev) => prev.filter((s) => s !== subtopic));
    } else if (!e.target.checked) {
      setUserSelectedSubtopics((prev) => prev.filter((s) => s !== subtopic));
      setUserSelectedSubtopicsTemp((prev) =>
        prev.filter((s) => s !== subtopic)
      );
      setUserUnfollow((prev) => [...prev, subtopic]);
    }
  };

  const handleButtonSave = async (index) => {
    if (userAlreadySubscribed[index]) {
      // if the user has subscribed to topics within the category then
      // the user's selections must be filtered so that if they're unsubscribing, they can only
      // unsubscribe from topics they were previously subscribed to, and if they're subscribing to
      // new topics, they can only subscribe to topics they aren't subscribed to
      let newUserSelectedSubtopics = [];
      let subtopicsToUnfollow = [];
      // get the user subscribed topics for this category
      let userSubscribedDataForThisCategory = userSubscribed.filter(
        (s) => s.category_id === topics[index].category_id
      );
      let onlySubtopics = userSubscribedDataForThisCategory.map(
        (a) => a.topic_id
      );
      subtopicsToUnfollow = userUnfollow.filter((s) =>
        onlySubtopics.includes(s)
      );
      newUserSelectedSubtopics = userSelectedSubTopicsTemp.filter(
        (s) => !onlySubtopics.includes(s)
      );
      // if the user deselects all their subscribed topics then they get unsubscribed from the category
      if (
        JSON.stringify(onlySubtopics) === JSON.stringify(subtopicsToUnfollow)
      ) {
        await API.graphql(
          graphqlOperation(userUnfollowCategory, {
            user_id: userID,
            category_id: topics[index].category_id,
          })
        );
      } else {
        // subscribe to the new topics the user has selected
        if (newUserSelectedSubtopics.length !== 0) {
          let topicsToRemove = newUserSelectedSubtopics.map((s) =>
            s.toString()
          );
          for (let x = 0; x < newUserSelectedSubtopics.length; x++) {
            await API.graphql(
              graphqlOperation(userFollowCategoryTopic, {
                user_id: userID,
                category_id: topics[index].category_id,
                topic_id: newUserSelectedSubtopics[x],
                email_notice: user.email_notice,
                sms_notice: user.sms_notice,
              })
            );
          }
          for (let m = 0; m < topicsToRemove.length; m++) {
            setUserSelectedSubtopicsTemp((prev) =>
              prev.filter((s) => !s.toString().includes(topicsToRemove))
            );
          }
        }
        // unsubscribe from the topics the user has deselected
        if (subtopicsToUnfollow.length !== 0) {
          let topicsToRemove = subtopicsToUnfollow.map((s) => s.toString());
          for (let n = 0; n < subtopicsToUnfollow.length; n++) {
            console.log(subtopicsToUnfollow[n]);
            await API.graphql(
              graphqlOperation(userUnfollowCategoryTopic, {
                user_id: userID,
                category_id: topics[index].category_id,
                topic_id: subtopicsToUnfollow[n],
              })
            );
          }
          for (let m = 0; m < topicsToRemove.length; m++) {
            setUserUnfollow((prev) =>
              prev.filter((s) => !s.toString().includes(topicsToRemove))
            );
          }
        }
      }
      getUserSubscriptions(topics);
    } else {
      let topicsToRemove = selectedSubTopics.map((s) => s.toString());
      console.log("selectedSubTopics", selectedSubTopics);
      for (let i = 0; i < selectedSubTopics.length; i++) {
        let userFollowData = {
          user_id: userID,
          category_id: topics[index].category_id,
          topic_id: selectedSubTopics[i],
          email_notice: user.email_notice,
          sms_notice: user.sms_notice,
        };
        await API.graphql(
          graphqlOperation(userFollowCategoryTopic, userFollowData)
        );
      }
      for (let m = 0; m < topicsToRemove.length; m++) {
        setSelectedSubtopics((prev) =>
          prev.filter((s) => !s.toString().includes(topicsToRemove))
        );
      }
    }
    setAlert(true);
  };

  // filter for only user subscriptions
  const handleCheck = async (e) => {
    setImage([]);
    setSubtopics([]);
    setUserSelectedSubtopics([]);
    setUserAlreadySubscribed([]);
    if (e.target.checked) {
      getOnlyUserSubscribedData();
    } else {
      queriedData();
    }
  };

  const displayTopicOptions = () => {
    return (
      topics &&
      topics.length > 0 &&
      topics.map((topic, index) => (
        <Card
          sx={{
            width: "90%",
            display: "flex",
            justifyContent: "space-between",
            flexDirection: "column",
          }}
        >
          <CardHeader
            title={topic.title}
            titleTypographyProps={{
              fontSize: "1.2rem",
              fontWeight: "400",
            }}
          />
          {topic.picture_location !== null ? (
            <CardMedia component={"img"} image={image[index]} height="150" />
          ) : (
            <Box
              sx={{
                backgroundColor: "#738DED",
                height: "150px",
                width: "100%",
              }}
            />
          )}
          <CardContent sx={{ p: "16px 16px 0px 16px" }}>
            <Typography variant="body2" color="text.secondary">
              {topic.description}
            </Typography>
            {userAlreadySubscribed[index] ? (
              <FormGroup sx={{ marginTop: 2, flexDirection: "row" }}>
                {subtopics[index]?.map((subtopic, index) => (
                  <FormControlLabel
                    key={index}
                    control={<Checkbox />}
                    checked={userSelectedSubTopics.includes(subtopic.topic_id)}
                    label={subtopic.name}
                    onChange={(e) =>
                      handleAlreadySubscribedChange(e, subtopic.topic_id)
                    }
                  />
                ))}
              </FormGroup>
            ) : (
              <FormGroup sx={{ marginTop: 2, flexDirection: "row" }}>
                {subtopics[index]?.map((subtopic, index) => (
                  <FormControlLabel
                    key={index}
                    control={<Checkbox />}
                    checked={selectedSubTopicsCheckbox.includes(
                      subtopic.topic_id
                    )}
                    label={subtopic.name}
                    onChange={(e) => handleChange(e, subtopic.topic_id)}
                  />
                ))}
              </FormGroup>
            )}
          </CardContent>
          <CardActions
            disableSpacing
            sx={{ justifyContent: "flex-end", pt: "0px" }}
          >
            <Button sx={{ mr: "1em" }} onClick={() => handleButtonSave(index)}>
              {I18n.get("save")}
            </Button>
          </CardActions>
        </Card>
      ))
    );
  };

  return (
    <Grid
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        height: "100%",
      }}
    >
      {alert ? (
        <Collapse in={alert}>
          <Alert severity={"success"} onClose={() => setAlert(false)}>
            Your changes have been saved
          </Alert>
        </Collapse>
      ) : (
        <></>
      )}
      <Typography variant="body1" sx={{ mb: "2em" }}>
        {I18n.get("initialCategoriesSelect")}{" "}
      </Typography>
      <FormControlLabel
        control={<Checkbox onChange={handleCheck} />}
        label={I18n.get("subscribedFilter")}
      />
      <Box
        sx={{
          display: "grid",
          mt: "2em",
          gridTemplateColumns: {
            xs: "repeat(1, 2fr)",
            sm: "repeat(3, 2fr)",
            md: "repeat(4, 2fr)",
          },
          rowGap: 3,
          [`& .${imageListItemClasses.root}`]: {
            display: "flex",
            flexDirection: "column",
          },
          justifyItems: "center",
        }}
      >
        {displayTopicOptions()}
      </Box>
    </Grid>
  );
};

export default ViewTopics;
