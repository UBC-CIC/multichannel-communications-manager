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
  Alert,
  Collapse
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { Auth, API, graphqlOperation, Storage } from "aws-amplify"
import "./TopicCard.css";
import { getTopicsOfCategoryByAcronym, getUserByEmail } from "../graphql/queries";

const TopicCard = ({
  selectedTopic,
  setSaveEnabled,
  selectedSubTopics,
  setSelectedSubtopics,
  setAllSelectedTopics
}) => {
  const { title, description, picture_location } = selectedTopic;
  const [selectedNotifications, setSelectedNotifications] = useState({});
  const [boxChecked, setBoxCheck] = useState([])
  const [alteredSubtopic, setAlteredSubtopic] = useState([])
  const [subtopics, setSubtopics] = useState([])
  const [userID, setUserID] = useState("")
  const [image, setImage] = useState('')
  const [alert, setAlert] = useState(false)

  async function queriedSubtopics() {
    let queriedTopics = await API.graphql(graphqlOperation(getTopicsOfCategoryByAcronym, {category_acronym: selectedTopic.acronym}))
    let onlyTopics = queriedTopics.data.getTopicsOfCategoryByAcronym
    let topics = onlyTopics.map(a => a.acronym)
    setSubtopics(topics)
  }

  useEffect(() => {
    queriedSubtopics()
    async function retrieveUser() {
      try {
        const returnedUser = await Auth.currentAuthenticatedUser();
        let databaseUser = await API.graphql(graphqlOperation(getUserByEmail, { user_email: returnedUser.attributes.email }));
        setSelectedNotifications({email: databaseUser.data.getUserByEmail.email_notice,
          text: databaseUser.data.getUserByEmail.sms_notice})
        setUserID(databaseUser.data.getUserByEmail.user_id)
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
    setSaveEnabled(false)
  }, []);

  const handleSaved = () => {
    setSaveEnabled(true)
    for (let x = 0; x < boxChecked.length; x++) {
      if (boxChecked[x] === false) {
        setAllSelectedTopics((prev) => prev.filter((s) => !(s.category_acronym === selectedTopic.acronym && s.topic_acronym === alteredSubtopic[x])))
      } else {
        let userSubscribeData = {
          user_id: userID,
          category_acronym: selectedTopic.acronym,
          topic_acronym: alteredSubtopic[x],
          email_notice: selectedNotifications.email,
          sms_notice: selectedNotifications.text
        }
        setAllSelectedTopics(prev => [...prev, userSubscribeData])
      }
    } 
    setAlert(true)
  }

  //updates setSelectedSubtopics every time subtopics are selected/unselected by user
  const handleChange = (e, subtopic) => {
    setAlteredSubtopic((prev) => [...prev, subtopic])
    if (e.target.checked) {
      setBoxCheck((prev) => [...prev, true])
      setSelectedSubtopics((prev) => [...prev, `${title}/${subtopic}`]);
    } else if (!e.target.checked) {
      setBoxCheck((prev) => [...prev, false])
      setSelectedSubtopics((prev) =>
        prev.filter((s) => s !== `${title}/${subtopic}`)
      );
    }
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
          <FormGroup sx={{marginTop: 2, flexDirection: 'row'}}>
          {subtopics.map((subtopic, index) => (
            <FormControlLabel
              key={index}
              control={<Checkbox />}
              checked={selectedSubTopics.includes(`${title}/${subtopic}`)}
              label={subtopic}
              onChange={(e) => handleChange(e, subtopic)}
            />
          ))}
        </FormGroup>
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
            <Button sx={{ mr: "1em" }} onClick={handleSaved}>
            Save
          </Button>
          </Box>
        </CardActions>
      </Card>
    </>
  );
};

export default TopicCard;
