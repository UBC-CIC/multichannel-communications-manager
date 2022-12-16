import {
  Card,
  CardHeader,
  CardMedia,
  Typography,
  CardContent,
  CardActions,
  Box,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Collapse,
  Alert
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { Auth, Storage, API, graphqlOperation } from "aws-amplify";
import "../TopicCard.css";
import { getTopicsOfCategoryByAcronym, getUserByEmail, getUserCategoryTopicByUserId } from "../../graphql/queries";
import { userFollowCategoryTopic, userUnfollowCategoryTopic, userUnfollowCategory } from "../../graphql/mutations";

const ViewTopicsCard = ({ selectedTopic }) => {
  const { title, description, picture_location } = selectedTopic;
  const [selectedSubTopics, setSelectedSubtopics] = useState([]);
  const [initialUserSelectedSubTopics, setInitialUserSelectedSubtopics] = useState([]);
  const [userSelectedSubTopics, setUserSelectedSubtopics] = useState([]);
  const [userUnfollow, setUserUnfollow] = useState([]);
  const [userID, setUserID] = useState("");
  const [subtopics, setSubtopics] = useState([]);
  const [userAlreadySubscribed, setUserAlreadySubscribed] = useState(false);
  const [user, setUser] = useState()
  const [image, setImage] = useState('');
  const [alert, setAlert] = useState(false)

  async function getSubtopics(id) {
    let getUserSubscribed = await API.graphql(graphqlOperation(getUserCategoryTopicByUserId, {user_id: id}))
    let userSubscribedSubtopics = getUserSubscribed.data.getUserCategoryTopicByUserId
    let filteredUserSubscribedSubtopics = userSubscribedSubtopics.filter((s) => s.category_acronym === selectedTopic.acronym)
    if (filteredUserSubscribedSubtopics.length !== 0) {
      for (let i = 0; i < filteredUserSubscribedSubtopics.length; i++) {
        setUserSelectedSubtopics((prev) => [...prev, filteredUserSubscribedSubtopics[i].topic_acronym]);
        setInitialUserSelectedSubtopics((prev) => [...prev, filteredUserSubscribedSubtopics[i].topic_acronym]);
      }
      setUserAlreadySubscribed(true);
    } 
    
    let queriedTopics = await API.graphql(graphqlOperation(getTopicsOfCategoryByAcronym, {
        category_acronym: selectedTopic.acronym,
      })
    );
    let onlyTopics = queriedTopics.data.getTopicsOfCategoryByAcronym;
    let topics = onlyTopics.map((a) => a.acronym);
    setSubtopics(topics);
  }

  useEffect(() => {
    async function retrieveUser() {
      try {
        const returnedUser = await Auth.currentAuthenticatedUser();
        let getUserId = await API.graphql(graphqlOperation(getUserByEmail, {
          user_email: returnedUser.attributes.email
        }))
        getSubtopics(getUserId.data.getUserByEmail.user_id);
        setUserID(getUserId.data.getUserByEmail.user_id)
        setUser(getUserId.data.getUserByEmail)
      } catch (e) {
        console.log(e);
      }
    }
    async function getCategoryImage() {
      let imageURL = await Storage.get(picture_location)
      setImage(imageURL)
    }
    getCategoryImage()
    retrieveUser();
  }, []);

  //updates setSelectedSubtopics every time subtopics are selected/unselected by user
  const handleChange = (e, subtopic) => {
    if (e.target.checked) {
      setSelectedSubtopics((prev) => [...prev, `${subtopic}`]);
    } else if (!e.target.checked) {
      setSelectedSubtopics((prev) =>
        prev.filter((s) => s !== `${subtopic}`)
      );
    }
  };

  const handleAlreadySubscribedChange = (e, subtopic) => {
    if (e.target.checked) {
      setUserSelectedSubtopics((prev) => [...prev, `${subtopic}`]);
      setUserUnfollow((prev) =>
        prev.filter((s) => s !== `${subtopic}`)
      );
    } else if (!e.target.checked) {
      setUserSelectedSubtopics((prev) =>
        prev.filter((s) => s !== `${subtopic}`)
      );
      setUserUnfollow((prev) => [...prev, `${subtopic}`]);
    }
  };

  const handleButtonSave = async () => {
    if (userAlreadySubscribed) {
      let newUserSelectedSubtopics = []
      let subtopicsToUnfollow = []
      subtopicsToUnfollow = userUnfollow.filter((s) => initialUserSelectedSubTopics.includes(s))
      newUserSelectedSubtopics = userSelectedSubTopics.filter((s) => !(initialUserSelectedSubTopics.includes(s)))
      if (JSON.stringify(initialUserSelectedSubTopics) === JSON.stringify(subtopicsToUnfollow)) {
        await API.graphql(graphqlOperation(userUnfollowCategory, {
          user_id: userID,
          category_acronym: selectedTopic.acronym
        }))
      } else {
        if (newUserSelectedSubtopics.length !== 0) {
          for (let x = 0; x < newUserSelectedSubtopics.length; x++) {
            await API.graphql(graphqlOperation(userFollowCategoryTopic, {
              user_id: userID,
              category_acronym: selectedTopic.acronym,
              topic_acronym: newUserSelectedSubtopics[x],
              email_notice: user.email_notice,
              sms_notice: user.sms_notice
            }))
          }
        }
        if (subtopicsToUnfollow.length !== 0) {
          for (let n = 0; n < subtopicsToUnfollow.length; n++) {
            await API.graphql(graphqlOperation(userUnfollowCategoryTopic, {
              user_id: userID,
              category_acronym: selectedTopic.acronym,
              topic_acronym: subtopicsToUnfollow[n]
            }))
          }
        }
      }
    } else {
      for (let i = 0; i < selectedSubTopics.length; i++) {
        let userFollowData = {
          user_id: userID,
          category_acronym: selectedTopic.acronym,
          topic_acronym: selectedSubTopics[i],
          email_notice: user.email_notice,
          sms_notice: user.sms_notice
        }
        await API.graphql(graphqlOperation(userFollowCategoryTopic, userFollowData))
      }
    }
    setAlert(true)
  };

  return (
    <>
      {alert ? <Collapse in={alert}><Alert severity={"success"} onClose={() => setAlert(false)}>Your changes have been saved</Alert></Collapse> : <></> }
      <Card>
        <CardHeader
          title={title}
          titleTypographyProps={{
            fontSize: "1.2rem",
            fontWeight: "400",
          }}
        />
        {picture_location !== null ? (
          <CardMedia component={"img"} image={image} sx={{objectFit: 'fill'}} height="150" />
        ) : (
          <Box
            sx={{
              backgroundColor: "#738DED",
              height: "120px",
              width: "100%",
            }}
          />
        )}
        <CardContent sx={{ p: "16px 16px 0px 16px" }}>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
          {userAlreadySubscribed ? (
            <FormGroup sx={{marginTop: 2, flexDirection: 'row'}}>
              {subtopics.map((subtopic, index) => (
                <FormControlLabel
                  key={index}
                  control={<Checkbox />}
                  checked={userSelectedSubTopics.includes(subtopic)}
                  label={subtopic}
                  onChange={(e) => handleAlreadySubscribedChange(e, subtopic)}
                />
              ))}
            </FormGroup>
          ) : (
            <FormGroup sx={{marginTop: 2, flexDirection: 'row'}}>
              {subtopics.map((subtopic, index) => (
                <FormControlLabel
                  key={index}
                  control={<Checkbox />}
                  checked={selectedSubTopics.includes(`${subtopic}`)}
                  label={subtopic}
                  onChange={(e) => handleChange(e, subtopic)}
                />
              ))}
            </FormGroup>
          )}
        </CardContent>
        <CardActions
          disableSpacing
          sx={{ justifyContent: "flex-end", pt: "0px" }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Button sx={{ mr: "1em" }} onClick={handleButtonSave}>
              Save
            </Button> 
          </Box>
        </CardActions>
      </Card>
    </>
  );
};

export default ViewTopicsCard;
