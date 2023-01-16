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
  Collapse,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { Auth, API, graphqlOperation, Storage, I18n } from "aws-amplify";
import "./TopicCard.css";
import { getTopicsOfCategory, getUserByEmail } from "../graphql/queries";

const TopicCard = ({
  selectedTopic,
  setSaveEnabled,
  selectedSubTopics,
  setSelectedSubtopics,
  setAllSelectedTopics,
  language,
}) => {
  const { title, description, picture_location } = selectedTopic;
  const [selectedNotifications, setSelectedNotifications] = useState({});
  const [boxChecked, setBoxCheck] = useState([]);
  const [alteredSubtopic, setAlteredSubtopic] = useState([]);
  const [subtopics, setSubtopics] = useState([]);
  const [userID, setUserID] = useState("");
  const [image, setImage] = useState("");
  const [alert, setAlert] = useState(false);
  // const [language, setLanguage] = useState(
  //   navigator.language === "fr" || navigator.language.startsWith("fr-")
  //     ? "fr"
  //     : "en"
  // );

  async function queriedSubtopics() {
    let queriedTopics = await API.graphql(
      graphqlOperation(getTopicsOfCategory, {
        category_id: selectedTopic.category_id,
        language: language,
      })
    );
    let onlyTopics = queriedTopics.data.getTopicsOfCategory;
    let topics = onlyTopics;
    setSubtopics(topics);
    console.log("subtopics on load", subtopics);
  }

  useEffect(() => {
    queriedSubtopics();
    async function retrieveUser() {
      try {
        const returnedUser = await Auth.currentAuthenticatedUser();
        let databaseUser = await API.graphql(
          graphqlOperation(getUserByEmail, {
            user_email: returnedUser.attributes.email,
          })
        );
        setSelectedNotifications({
          email: databaseUser.data.getUserByEmail.email_notice,
          text: databaseUser.data.getUserByEmail.sms_notice,
        });
        setUserID(databaseUser.data.getUserByEmail.user_id);
      } catch (e) {
        console.log(e);
      }
    }
    async function getCategoryImage() {
      let imageURL = await Storage.get(picture_location);
      setImage(imageURL);
    }
    getCategoryImage();
    retrieveUser();
    setSaveEnabled(false);
  }, [language]);

  const handleSaved = () => {
    setSaveEnabled(true);
    // go through all the selected topics
    for (let x = 0; x < boxChecked.length; x++) {
      if (boxChecked[x] === false) {
        // remove from allselectedtopics as the topic has been deselected
        setAllSelectedTopics((prev) =>
          prev.filter(
            (s) =>
              !(
                s.category_id === selectedTopic.category_id &&
                s.topic_id === alteredSubtopic[x].topic_id
              )
          )
        );
      } else {
        let userSubscribeData = {
          user_id: userID,
          category_id: selectedTopic.category_id,
          topic_id: alteredSubtopic[x].topic_id,
          email_notice: selectedNotifications.email,
          sms_notice: selectedNotifications.text,
        };
        setAllSelectedTopics((prev) => [...prev, userSubscribeData]);
      }
    }
    setAlert(true);
  };

  // get the topics and whether they've been selected/deselected
  const handleChange = (e, subtopic) => {
    console.log("in handleChange");
    setAlteredSubtopic((prev) => [...prev, subtopic]);
    console.log("alteredSubtopic", alteredSubtopic);
    if (e.target.checked) {
      console.log("in checked");
      setBoxCheck((prev) => [...prev, true]);
      console.log("boxcheck", boxChecked);

      setSelectedSubtopics((prev) => [...prev, `${title}/${subtopic.name}`]);
      console.log("selectedSubTopics", selectedSubTopics);
    } else if (!e.target.checked) {
      console.log("in not checked");

      setBoxCheck((prev) => [...prev, false]);
      console.log("boxcheck", boxChecked);

      setSelectedSubtopics((prev) =>
        prev.filter((s) => s !== `${title}/${subtopic.name}`)
      );
      console.log("selectedSubTopics", selectedSubTopics);
    }
  };

  return (
    <>
      {alert ? (
        <Collapse in={alert}>
          <Alert severity={"success"} onClose={() => setAlert(false)}>
            {I18n.get("changesSaved")}
          </Alert>
        </Collapse>
      ) : (
        <></>
      )}
      <Card>
        <CardHeader
          title={title}
          titleTypographyProps={{
            fontSize: "1.2rem",
            fontWeight: "400",
          }}
        />
        {picture_location !== null ? (
          <CardMedia
            component={"img"}
            image={image}
            sx={{ objectFit: "fill" }}
            height="150"
          />
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
          <FormGroup sx={{ marginTop: 2, flexDirection: "row" }}>
            {subtopics.map((subtopic, index) => (
              <FormControlLabel
                key={index}
                control={<Checkbox />}
                checked={selectedSubTopics.includes(
                  `${title}/${subtopic.name}`
                )}
                label={subtopic.name}
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
              {I18n.get("save")}
            </Button>
          </Box>
        </CardActions>
      </Card>
    </>
  );
};

export default TopicCard;
