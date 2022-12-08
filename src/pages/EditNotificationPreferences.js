import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  IconButton,
  Box,
  Switch,
  TextField,
  InputAdornment,
  Typography,
  Grid,
  Divider,
} from "@mui/material";
import { Search } from "@mui/icons-material";
import { Auth, API, graphqlOperation } from "aws-amplify";
import { getUserByEmail, getCategoriesByUserId, getTopicsOfCategoryByAcronym } from "../graphql/queries";
import UnsubscribeDialog from "../components/UnsubscribeDialog";
import { userUnfollowCategory, userUpdateChannelPrefrence } from "../graphql/mutations";

const EditNotificationPreferences = () => {
  const [searchVal, setSearchVal] = useState("");
  const [topics, setTopics] = useState([]);
  const [initialTopics, setInitialTopics] = useState([]);
  const [topicIndex, setTopicIndex] = useState({ index: "", type: "" });
  const [updateWithRemovedTopics, setUpdateWithRemovedTopics] = useState([]);
  const [filterRemovedTopics, setFilterRemovedTopics] = useState({});
  const [userID, setUserID] = useState("");
  const [title, setTitle] = useState("");
  const [notificationType, setNotificationType] = useState("");
  const [openUnsubscribeDialog, setOpenUnsubscribeDialog] = useState(false);

  async function queriedData() {
    try {
      const returnedUser = await Auth.currentAuthenticatedUser();
      let user = await API.graphql(
        graphqlOperation(getUserByEmail, {
          user_email: returnedUser.attributes.email,
        })
      );
      let categories = await API.graphql(
        graphqlOperation(getCategoriesByUserId, {
          user_id: user.data.getUserByEmail.user_id,
        })
      );
      setUserID(user.data.getUserByEmail.user_id)
      setInitialTopics(categories.data.getCategoriesByUserId);
      setTopics(categories.data.getCategoriesByUserId);
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    queriedData();
  }, []);

  function search() {
    if (searchVal === "") {
      return;
    } else {
      let searchValLowerCase = searchVal.toLowerCase();
      let filteredTopics = topics.filter((s) =>
        s.title.toLowerCase().includes(searchValLowerCase)
      );
      setTopics(filteredTopics);
    }
  }

  function onChange(e) {
    setSearchVal(e.target.value);
    if (e.target.value === "") {
      setTopics(initialTopics);
    }
  }

  function handleEmailChange(e) {
    const test = [...topics];
    // console.log(test);
    const { id } = e.target;
    setTopicIndex({ index: id, type: "email_notice" });
    test[id].email_notice = !topics[id].email_notice;
    unSubscribe(test[id], test);
  }

  function handleTextChange(e) {
    const test = [...topics];
    // console.log(test)
    const { id } = e.target;
    setTopicIndex({ index: id, type: "sms_notice" });
    test[id].sms_notice = !topics[id].sms_notice;
    unSubscribe(test[id], test);
  }

  async function unSubscribe(topic, updatedTopics) {
    if (!topic.sms_notice && !topic.email_notice) {
      setTitle(topic.title);
      setNotificationType("");
      setOpenUnsubscribeDialog(true);
      setUpdateWithRemovedTopics(topics.filter((s) => s !== topic));
      setFilterRemovedTopics(topic);
    } else if (!topic.sms_notice && topic.email_notice) {
      setTitle(topic.title);
      setNotificationType("Text");
      setOpenUnsubscribeDialog(true);
      setFilterRemovedTopics(topic);
    } else if (topic.sms_notice && !topic.email_notice) {
      setTitle(topic.title);
      setNotificationType("Email");
      setOpenUnsubscribeDialog(true);
      setFilterRemovedTopics(topic);
    } else {
      let topics = await API.graphql(graphqlOperation(getTopicsOfCategoryByAcronym, {
        category_acronym: filterRemovedTopics.category_acronym
      }))
      for (let i = 0; i < topics.length; i++) {
        await API.graphql(graphqlOperation(userUpdateChannelPrefrence, {
          user_id: userID,
          category_acronym: topic.category_acronym,
          topic_acronym: topics[i].acronym,
          email_notice: topic.email_notice,
          sms_notice: topic.sms_notice
        }))
      }
      setTopics(updatedTopics);
    }
  }

  function onKeyDownSearch(e) {
    if (e.keyCode === 13) {
      search();
    }
  }

  async function handleUnsubscribe() {
    console.log(filterRemovedTopics);
    if (!filterRemovedTopics.email_notice && !filterRemovedTopics.sms_notice) {
      await API.graphql(graphqlOperation(userUnfollowCategory, {
        user_id: userID,
        category_acronym: filterRemovedTopics.category_acronym
      }))
      setInitialTopics(updateWithRemovedTopics)
      setTopics(updateWithRemovedTopics);
    } else {
        let topics = await API.graphql(graphqlOperation(getTopicsOfCategoryByAcronym, {
          category_acronym: filterRemovedTopics.category_acronym
        }))
        for (let i = 0; i < topics.length; i++) {
          await API.graphql(graphqlOperation(userUpdateChannelPrefrence, {
            user_id: userID,
            category_acronym: filterRemovedTopics.category_acronym,
            topic_acronym: topics[i].acronym,
            email_notice: filterRemovedTopics.email_notice,
            sms_notice: filterRemovedTopics.sms_notice
          }))
        }
    }
    setOpenUnsubscribeDialog(false);
  }

  function handleUnsubscribeClose() {
    if (topicIndex.type === "email_notice") {
      topics[topicIndex.index].email_notice =
        !topics[topicIndex.index].email_notice;
    } else {
      topics[topicIndex.index].sms_notice =
        !topics[topicIndex.index].email_notice;
    }
    setOpenUnsubscribeDialog(false);
  }

  const displaySubscribedTopics = () => {
    return topics.map((topic, i) => (
      <Card sx={{ width: { md: "80%" } }}>
        <Box sx={{ display: "flex", flexDirection: "row", margin: 2, gap: 15 }}>
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              gap: 3,
            }}
          >
            <Typography variant="h5" component="div">
              {topic.title}
            </Typography>
            <Typography variant="body2">{topic.description}</Typography>
          </CardContent>
          <CardContent>
            <Box
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                gap: 5,
              }}
            >
              <Box
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                <Typography variant="body1">Email Notifications</Typography>
                <Typography variant="body1">Text Notifications</Typography>
              </Box>
              <Divider orientation="vertical" variant="middle" flexItem />
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                <Switch
                  checked={topic.email_notice}
                  id={i.toString()}
                  onChange={handleEmailChange}
                />
                <Switch
                  checked={topic.sms_notice}
                  id={i.toString()}
                  onChange={handleTextChange}
                />
              </Box>
            </Box>
          </CardContent>
        </Box>
      </Card>
    ));
  };

  return (
    <>
      <Typography variant="h3" sx={{ mb: "1.5em" }}>
        Manage My Notifications
      </Typography>
      <Grid
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 3,
        }}
      >
        <Box sx={{ width: { md: "80%" } }}>
          <TextField
            fullWidth
            placeholder="Search..."
            size="small"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={search}>
                    <Search />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            onChange={onChange}
            onKeyDown={onKeyDownSearch}
          />
        </Box>
        {displaySubscribedTopics()}
      </Grid>
      <UnsubscribeDialog
        open={openUnsubscribeDialog}
        handleClose={handleUnsubscribeClose}
        title={title}
        notificationType={notificationType}
        handleSave={handleUnsubscribe}
      />
    </>
  );
};

export default EditNotificationPreferences;
