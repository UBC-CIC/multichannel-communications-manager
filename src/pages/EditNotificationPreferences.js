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
  Divider
} from "@mui/material";
import { Search } from "@mui/icons-material";
import { Auth, API, graphqlOperation } from "aws-amplify"
import { getUserByEmail, getUserCategoryTopicByUserId } from "../graphql/queries";


const EditNotificationPreferences = () => {
  //hard coded mock data for now, to be replaced with queried data
  const sampleTopics = [
    {
      title: "Health",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt",
      email_notice: true,
      sms_notice: true
    },
    {
      title: "Insolvency",
      description:
        "Consumer proposals, bankruptcy and how to find a Licensed Insolvency Trustee.",
      email_notice: true,
      sms_notice: false
    },
    {
      title: "Money and Finances",
      description:
        "Managing your money, debt and investments, planning for retirement and protecting yourself from consumer fraud.",
      email_notice: false,
      sms_notice: true
    },
    {
      title: "Federal Corporations",
      description:
        "Incorporating or making changes to a business corporation, not-for-profit, cooperative or board of trade.",
      email_notice: false,
      sms_notice: true
    },
    {
      title: "Sample 5",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt",
      email_notice: true,
      sms_notice: false
    },
    {
      title: "Sample 6",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt",
      email_notice: true,
      sms_notice: false
    },
    {
      title: "Sample 7",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt",
      email_notice: true,
      sms_notice: false
    },
    {
      title: "Sample 8",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt",
      email_notice: true,
      sms_notice: false
    },
    {
      title: "Sample 9",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt",
      email_notice: true,
      sms_notice: false
    },
  ];

  const [searchVal, setSearchVal] = useState("");
  const [topics, setTopics] = useState([])

  async function queriedData() {
    try {
      const returnedUser = await Auth.currentAuthenticatedUser();
      let user = await API.graphql(graphqlOperation(getUserByEmail, { user_email: returnedUser.attributes.email }));
      let test = await API.graphql(graphqlOperation(getUserCategoryTopicByUserId, {user_id: user.data.getUserByEmail.user_id}))
      setTopics(test.data.getUserCategoryTopicByUserId)
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    queriedData()
  }, []);

  function search() {
    if (searchVal === "") {
      return;
    } else {
      let searchValLowerCase = searchVal.toLowerCase()
      let filteredTopics = topics.filter((s) => s.title.toLowerCase().includes(searchValLowerCase))
      setTopics(filteredTopics)
    }
  }
  
  function onChange(e) {
    setSearchVal(e.target.value)
    if (e.target.value === "") {
      setTopics(sampleTopics)
    }
  }

  function handleEmailChange(e) {
    const test = [...topics]
    console.log(test)
    const { id } = e.target
    test[id].email_notice = !topics[id].email_notice
    setTopics(test)
  }

  function handleTextChange(e) {
    const test = [...topics]
    console.log(test)
    const { id } = e.target
    test[id].sms_notice = !topics[id].sms_notice
    setTopics(test)
  }

  function onKeyDownSearch(e) {
    if (e.keyCode === 13) {
      search()
    }
  }

  const displaySubscribedTopics = () => {
    return (
      topics
        .map((topic, i) => (
          <Card sx={{width: {md: '80%'}}}>
            <Box sx={{display: 'flex', flexDirection: 'row', margin: 2, gap: 15}}>
              <CardContent sx={{
                display: "flex",
                flexDirection: "column",
                width: '100%',
                gap: 3
              }}>
                <Typography variant="h5" component="div">
                  {topic.title}
                </Typography>
                <Typography variant="body2">
                  {topic.description}
                </Typography>
              </CardContent>
              <CardContent>
                <Box sx={{
                    height: '100%',
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 5
                  }}>
                  <Box sx={{
                    height: '100%',
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 3
                  }}>
                    <Typography variant="body1">
                      Email Notifications
                    </Typography>
                    <Typography variant="body1">
                      Text Notifications
                    </Typography>
                  </Box>
                  <Divider orientation="vertical" variant="middle" flexItem />
                  <Box sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: 'center',
                    gap: 3
                  }}>
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
        ))
    );
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
          alignItems: 'center',
          gap: 3
        }}
      >
        <Box sx={{width: {md: '80%'}}}>
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
              )
            }}
            onChange={onChange}
            onKeyDown={onKeyDownSearch}
          />
        </Box>
        {displaySubscribedTopics()}
      </Grid>
    </>
  );
};

export default EditNotificationPreferences;
