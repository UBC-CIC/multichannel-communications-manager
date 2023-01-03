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
  getAllCategories,
  getUserCategoryTopicByUserId,
  getUserByEmail,
  getTopicsOfCategoryByAcronym,
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

  async function getCategoryImages(categories) {
    for (let i = 0; i < categories.length; i++) {
      let imageURL = await Storage.get(categories[i].picture_location);
      setImage((prev) => [...prev, imageURL]);
    }
  }

  async function queriedData() {
    let categories = await API.graphql(graphqlOperation(getAllCategories));
    let allCategories = categories.data.getAllCategories;
    setTopics(allCategories);
    getCategoryImages(allCategories);
    getTopics(allCategories);
    getUserSubscriptions(allCategories);
  }

  async function getTopics(allCategories) {
    for (let i = 0; i < allCategories.length; i++) {
      let queriedTopics = await API.graphql(
        graphqlOperation(getTopicsOfCategoryByAcronym, {
          category_acronym: allCategories[i].acronym,
        })
      );
      let onlyTopics = queriedTopics.data.getTopicsOfCategoryByAcronym;
      let topics = onlyTopics;
      // .map((a) => a.acronym);
      setSubtopics((subtopics) => [...subtopics, topics]);
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
      })
    );
    let noDuplicates = categories.data.getCategoriesByUserId.filter(
      (value, index, self) =>
        index === self.findIndex((t) => t.acronym === value.acronym)
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
        (s) => s.category_acronym === allCategories[x].acronym
      );
      if (filteredUserSubscribedSubtopics.length !== 0) {
        for (let i = 0; i < filteredUserSubscribedSubtopics.length; i++) {
          setUserSelectedSubtopics((prev) => [
            ...prev,
            filteredUserSubscribedSubtopics[i].topic_acronym,
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
    if (e.target.checked) {
      setSelectedSubtopics((prev) => [...prev, `${subtopic}`]);
      setSelectedSubtopicsCheckbox((prev) => [...prev, `${subtopic}`]);
    } else if (!e.target.checked) {
      setSelectedSubtopics((prev) => prev.filter((s) => s !== `${subtopic}`));
      setSelectedSubtopicsCheckbox((prev) =>
        prev.filter((s) => s !== `${subtopic}`)
      );
    }
  };

  const handleAlreadySubscribedChange = (e, subtopic) => {
    if (e.target.checked) {
      setUserSelectedSubtopics((prev) => [...prev, `${subtopic}`]);
      setUserSelectedSubtopicsTemp((prev) => [...prev, `${subtopic}`]);
      setUserUnfollow((prev) => prev.filter((s) => s !== `${subtopic}`));
    } else if (!e.target.checked) {
      setUserSelectedSubtopics((prev) =>
        prev.filter((s) => s !== `${subtopic}`)
      );
      setUserSelectedSubtopicsTemp((prev) =>
        prev.filter((s) => s !== `${subtopic}`)
      );
      setUserUnfollow((prev) => [...prev, `${subtopic}`]);
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
        (s) => s.category_acronym === topics[index].acronym
      );
      let onlySubtopics = userSubscribedDataForThisCategory.map(
        (a) => a.topic_acronym
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
            category_acronym: topics[index].acronym,
          })
        );
      } else {
        // subscribe to the new topics the user has selected
        if (newUserSelectedSubtopics.length !== 0) {
          let topicsToRemove = newUserSelectedSubtopics;
          for (let x = 0; x < newUserSelectedSubtopics.length; x++) {
            console.log(newUserSelectedSubtopics[x]);
            await API.graphql(
              graphqlOperation(userFollowCategoryTopic, {
                user_id: userID,
                category_acronym: topics[index].acronym,
                topic_acronym: newUserSelectedSubtopics[x],
                email_notice: user.email_notice,
                sms_notice: user.sms_notice,
              })
            );
          }
          for (let m = 0; m < topicsToRemove.length; m++) {
            setUserSelectedSubtopicsTemp((prev) =>
              prev.filter((s) => !s.includes(topicsToRemove))
            );
          }
        }
        // unsubscribe from the topics the user has deselected
        if (subtopicsToUnfollow.length !== 0) {
          let topicsToRemove = subtopicsToUnfollow;
          for (let n = 0; n < subtopicsToUnfollow.length; n++) {
            console.log(subtopicsToUnfollow[n]);
            await API.graphql(
              graphqlOperation(userUnfollowCategoryTopic, {
                user_id: userID,
                category_acronym: topics[index].acronym,
                topic_acronym: subtopicsToUnfollow[n],
              })
            );
          }
          for (let m = 0; m < topicsToRemove.length; m++) {
            setUserUnfollow((prev) =>
              prev.filter((s) => !s.includes(topicsToRemove))
            );
          }
        }
      }
      getUserSubscriptions(topics);
    } else {
      let topicsToRemove = selectedSubTopics;
      for (let i = 0; i < selectedSubTopics.length; i++) {
        let userFollowData = {
          user_id: userID,
          category_acronym: topics[index].acronym,
          topic_acronym: selectedSubTopics[i],
          email_notice: user.email_notice,
          sms_notice: user.sms_notice,
        };
        await API.graphql(
          graphqlOperation(userFollowCategoryTopic, userFollowData)
        );
      }
      for (let m = 0; m < topicsToRemove.length; m++) {
        setSelectedSubtopics((prev) =>
          prev.filter((s) => !s.includes(topicsToRemove))
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
            title={
              navigator.language === "fr" ||
              navigator.language.startsWith("fr-")
                ? topic.title_fr
                : topic.title
            }
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
              {navigator.language === "fr" ||
              navigator.language.startsWith("fr-")
                ? topic.description_fr
                : topic.description}
            </Typography>
            {userAlreadySubscribed[index] ? (
              <FormGroup sx={{ marginTop: 2, flexDirection: "row" }}>
                {subtopics[index]?.map((subtopic, index) => (
                  <FormControlLabel
                    key={index}
                    control={<Checkbox />}
                    checked={userSelectedSubTopics.includes(subtopic.acronym)}
                    label={
                      navigator.language === "fr" ||
                      navigator.language.startsWith("fr-")
                        ? subtopic.acronym_fr
                        : subtopic
                    }
                    onChange={(e) =>
                      handleAlreadySubscribedChange(e, subtopic.acronym)
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
                      subtopic.acronym
                    )}
                    label={
                      navigator.language === "fr" ||
                      navigator.language.startsWith("fr-")
                        ? subtopic.acronym_fr
                        : subtopic
                    }
                    onChange={(e) => handleChange(e, subtopic.acronym)}
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
