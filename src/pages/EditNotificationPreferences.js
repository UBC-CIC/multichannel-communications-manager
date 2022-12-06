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
import {
  getUserByEmail,
  getUserCategoryTopicByUserId,
} from "../graphql/queries";
import UnsubscribeDialog from "../components/UnsubscribeDialog";

const EditNotificationPreferences = () => {
  //hard coded mock data for now, to be replaced with queried data
  // const sampleTopics = [
  //   {
  //     title: "Health",
  //     description:
  //       "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt",
  //     email_notice: true,
  //     sms_notice: true,
  //   },
  //   {
  //     title: "Insolvency",
  //     description:
  //       "Consumer proposals, bankruptcy and how to find a Licensed Insolvency Trustee.",
  //     email_notice: true,
  //     sms_notice: false,
  //   },
  //   {
  //     title: "Money and Finances",
  //     description:
  //       "Managing your money, debt and investments, planning for retirement and protecting yourself from consumer fraud.",
  //     email_notice: false,
  //     sms_notice: true,
  //   },
  //   {
  //     title: "Federal Corporations",
  //     description:
  //       "Incorporating or making changes to a business corporation, not-for-profit, cooperative or board of trade.",
  //     email_notice: false,
  //     sms_notice: true,
  //   },
  //   {
  //     title: "Sample 5",
  //     description:
  //       "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt",
  //     email_notice: true,
  //     sms_notice: false,
  //   },
  //   {
  //     title: "Sample 6",
  //     description:
  //       "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt",
  //     email_notice: true,
  //     sms_notice: false,
  //   },
  //   {
  //     title: "Sample 7",
  //     description:
  //       "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt",
  //     email_notice: true,
  //     sms_notice: false,
  //   },
  //   {
  //     title: "Sample 8",
  //     description:
  //       "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt",
  //     email_notice: true,
  //     sms_notice: false,
  //   },
  //   {
  //     title: "Sample 9",
  //     description:
  //       "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt",
  //     email_notice: true,
  //     sms_notice: false,
  //   },
  // ];

  const [searchVal, setSearchVal] = useState("");
  const [topics, setTopics] = useState([]);
  const [topicIndex, setTopicIndex] = useState({ index: "", type: "" });
  const [filterRemovedTopics, setFilterRemovedTopics] = useState([]);
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
      console.log("user: ", JSON.stringify(user));
      let test = await API.graphql(
        graphqlOperation(getUserCategoryTopicByUserId, {
          user_id: user.data.getUserByEmail.user_id,
        })
      );
      console.log("test: ", JSON.stringify(test));
      setTopics(test.data.getUserCategoryTopicByUserId);
      setTopics(topics);
      console.log("topics: ", JSON.stringify(topics));
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
      setTopics(topics);
    }
  }

  function handleEmailChange(e) {
    const test = [...topics];
    console.log(test);
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

  function unSubscribe(topic, updatedTopics) {
    if (topic.sms_notice === false && topic.email_notice === false) {
      setTitle(topic.title);
      setNotificationType("");
      setOpenUnsubscribeDialog(true);
      setFilterRemovedTopics(topics.filter((s) => s !== topic));
    } else if (topic.sms_notice === false && topic.email_notice === true) {
      setTitle(topic.title);
      setNotificationType("Text");
      setOpenUnsubscribeDialog(true);
      setFilterRemovedTopics(updatedTopics);
    } else if (topic.sms_notice === true && topic.email_notice === false) {
      setTitle(topic.title);
      setNotificationType("Email");
      setOpenUnsubscribeDialog(true);
      setFilterRemovedTopics(updatedTopics);
    } else {
      setTopics(updatedTopics);
    }
  }

  function onKeyDownSearch(e) {
    if (e.keyCode === 13) {
      search();
    }
  }

  function handleUnsubscribe() {
    console.log(filterRemovedTopics);
    setTopics(filterRemovedTopics);
    setOpenUnsubscribeDialog(false);
  }

  function handleUnsubscribeClose() {
    if (topicIndex.type === "email_notice") {
      topics[topicIndex.index].email_notice =
        !filterRemovedTopics[topicIndex.index].email_notice;
    } else {
      topics[topicIndex.index].sms_notice =
        !filterRemovedTopics[topicIndex.index].sms_notice;
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
                  id={i}
                  key={i}
                  onChange={handleEmailChange}
                />
                <Switch
                  checked={topic.sms_notice}
                  id={i}
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
                <InputAdornment>
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
