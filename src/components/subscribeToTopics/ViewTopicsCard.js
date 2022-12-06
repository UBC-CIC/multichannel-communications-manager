import {
  Card,
  CardHeader,
  CardMedia,
  Typography,
  IconButton,
  CardContent,
  CardActions,
  Box,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import React, { useState, useEffect } from "react";
import { Auth } from "aws-amplify";
import NotificationPreferencesDialog from "../NotificationPreferencesDialog";
import NotificationSuccessDialog from "../NotificationSuccessDialog";
import "../TopicCard.css";
import PhoneNumberDialog from "../PhoneNumberDialog";
import { API, graphqlOperation } from "aws-amplify";
import { getTopicsOfCategoryByAcronym } from "../../graphql/queries";

const ViewTopicsCard = ({ selectedTopic }) => {
  const { title, description, image } = selectedTopic;
  const initialNotificationSelection = { text: false, email: false };
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
  const [openNotificationDialog, setOpenNotificationDialog] = useState(false);
  const [openPhoneDialog, setOpenPhoneDialog] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState(
    initialNotificationSelection
  );
  const [noTopicSelected, setNoTopicSelected] = useState(false);
  const [noPreferenceSelected, setNoPreferenceSelected] = useState(false);
  const [selectedSubTopics, setSelectedSubtopics] = useState([]);
  const [userSelectedSubTopics, setUserSelectedSubtopics] = useState([]);
  const [isRotated, setIsRotated] = useState(false);
  const [userPhone, setUserPhone] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [invalidInputError, setInvalidInputError] = useState(false);
  const [phoneDialogState, setPhoneDiologState] = useState("noPhone");
  const [user, setUser] = useState("");
  const [subtopics, setSubtopics] = useState([]);
  const [userAlreadySubscribed, setUserAlreadySubscribed] = useState(false);
  //example subtopics: these are hard coded for now but to be replaced with the queried subtopics for each topic of interest
  // const sampleSubtopics = [
  //   "COVID-19",
  //   "Subtopic 2",
  //   "Subtopic 3",
  //   "Subtopic 4",
  // ];
  // const userSubscribedSubtopics = {topic_acronym: ['Covid-19', 'Subtopic 2'], email_notice: true, sms_notice: false};
  const userSubscribedSubtopics = null;

  async function getSubtopics() {
    if (userSubscribedSubtopics !== null) {
      setSubtopics(userSubscribedSubtopics.topic_acronym);
      setUserSelectedSubtopics(userSubscribedSubtopics.topic_acronym);
      setUserAlreadySubscribed(true);
    } else {
      let queriedTopics = await API.graphql(
        graphqlOperation(getTopicsOfCategoryByAcronym, {
          category_acronym: selectedTopic.acronym,
        })
      );
      let onlyTopics = queriedTopics.data.getTopicsOfCategoryByAcronym;
      let topics = onlyTopics.map((a) => a.acronym);
      console.log("topics: ", topics);
      setSubtopics(topics);
      // setSubtopics(sampleSubtopics);
    }
  }

  useEffect(() => {
    getSubtopics();
    async function retrieveUser() {
      try {
        const returnedUser = await Auth.currentAuthenticatedUser();
        setUser(returnedUser);
        setUserPhone(returnedUser.attributes.phoneNumber);
      } catch (e) {
        console.log(e);
      }
    }
    retrieveUser();
  }, []);

  function checkPhone(num) {
    var regex = new RegExp(/\(?([0-9]{3})\)?([ .-]?)([0-9]{3})\2([0-9]{4})/);
    if (regex.test(num)) return true;
    else return false;
  }

  const handleSavePhoneDialog = async () => {
    if (phoneDialogState === "noPhone") {
      await Auth.updateUserAttributes(user, {
        phone_number: phoneNumber,
      })
        .then(async (res) => {
          console.log(res);
          await Auth.verifyCurrentUserAttribute("phone_number");
          setPhoneDiologState("verifyPhone");
        })
        .catch((e) => {
          console.log(e);
          setInvalidInputError(e.message);
        });
      // if (phoneNumber === "" || !checkPhone(phoneNumber)) {
      //   setInvalidInputError(true)
      // } else {
      //   await Auth.updateUserAttributes(user, {
      //     phone_number: phoneNumber,
      //   })
      //     .catch((e) => {
      //       console.log(e)
      //     })
      //   setPhoneDiologState("verifyPhone")
      // }
    } else if (phoneDialogState === "verifyPhone") {
      // if (verificationCode === "") {
      //   setInvalidInputError(true)
      // } else {
      await Auth.verifyCurrentUserAttributeSubmit(
        "phone_number",
        verificationCode
      )
        .then(() => {
          console.log("phone number verified");
          setPhoneDiologState("phoneSaved");
        })
        .catch((e) => {
          console.log("failed with error", e);
          setInvalidInputError(true);
        });
      // }
    } else {
      setOpenPhoneDialog(false);
    }
  };

  const handleCloseNotificationDialog = () => {
    setOpenNotificationDialog(false);
    setNoTopicSelected(false);
    setNoPreferenceSelected(false);
  };

  const handleSaveNotificationDialog = () => {
    if (selectedNotifications.text && userPhone === undefined) {
      setOpenPhoneDialog(true);
    } else if (!selectedNotifications.text && !selectedNotifications.email) {
      setNoPreferenceSelected(true);
      setSelectedNotifications({ text: false, email: false });
    } else if (
      selectedSubTopics.filter((s) => s.includes(selectedTopic.title))
        .length === 0
    ) {
      setNoTopicSelected(true);
      setSelectedNotifications({ text: false, email: false });
    } else {
      setNoTopicSelected(false);
      setOpenSuccessDialog(true);
    }
  };

  const handleCloseSuccessDialog = () => {
    setOpenSuccessDialog(false);
    setOpenNotificationDialog(false);
  };

  const handleClosePhoneDialog = () => {
    setSelectedNotifications({ text: false });
    setOpenPhoneDialog(false);
  };

  //updates setSelectedSubtopics every time subtopics are selected/unselected by user
  const handleChange = (e, subtopic) => {
    if (e.target.checked) {
      setSelectedSubtopics((prev) => [...prev, `${title}/${subtopic}`]);
    } else if (!e.target.checked) {
      setSelectedSubtopics((prev) =>
        prev.filter((s) => s !== `${title}/${subtopic}`)
      );
    }
  };

  const handleAlreadySubscribedChange = (e, subtopic) => {
    if (e.target.checked) {
      setUserSelectedSubtopics((prev) => [...prev, `${subtopic}`]);
    } else if (!e.target.checked) {
      setUserSelectedSubtopics((prev) =>
        prev.filter((s) => s !== `${subtopic}`)
      );
    }
  };

  const handleButtonSave = () => {
    if (userAlreadySubscribed) {
      //
    }
    setIsRotated(!isRotated);
  };

  function notificationPreferences() {
    if (userAlreadySubscribed) {
      if (
        userSubscribedSubtopics.email_notice &&
        userSubscribedSubtopics.sms_notice
      ) {
        return "Notifications Selected: Email, Text";
      } else if (
        userSubscribedSubtopics.email_notice &&
        !userSubscribedSubtopics.sms_notice
      ) {
        return "Notifications Selected: Email";
      } else {
        return "Notifications Selected: Text";
      }
    } else {
      if (selectedNotifications.email && selectedNotifications.text) {
        return "Notifications Selected: Email, Text";
      } else if (selectedNotifications.email && !selectedNotifications.text) {
        return "Notifications Selected: Email";
      } else if (!selectedNotifications.email && selectedNotifications.text) {
        return "Notifications Selected: Text";
      } else {
        return "Notifications Selected: None";
      }
    }
  }

  //renders front of the card displaying topic of interest information
  const renderCardFront = () => {
    return (
      <>
        <Card>
          <CardHeader
            title={title}
            titleTypographyProps={{
              fontSize: "1.2rem",
              fontWeight: "400",
            }}
          />
          {image ? (
            <CardMedia component={"img"} height="120" />
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
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: "1.5em" }}
            >
              {notificationPreferences()}
            </Typography>
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
              <Button
                sx={{ mr: "1em" }}
                onClick={() => setIsRotated(!isRotated)}
              >
                View Subtopics
              </Button>
              {userAlreadySubscribed ? (
                <></>
              ) : (
                <IconButton
                  aria-label="subscribe to topic"
                  onClick={() => setOpenNotificationDialog(true)}
                >
                  <NotificationsIcon />
                </IconButton>
              )}
            </Box>
          </CardActions>
        </Card>
        <NotificationPreferencesDialog
          open={openNotificationDialog}
          handleClose={handleCloseNotificationDialog}
          handleSave={handleSaveNotificationDialog}
          selectedTopic={selectedTopic}
          selectedNotifications={selectedNotifications}
          setSelectedNotifications={setSelectedNotifications}
          noTopicSelected={noTopicSelected}
          noPreferenceSelected={noPreferenceSelected}
        />
        <PhoneNumberDialog
          open={openPhoneDialog}
          handleClose={handleClosePhoneDialog}
          handleSave={handleSavePhoneDialog}
          state={phoneDialogState}
          phone={phoneNumber}
          setPhone={setPhoneNumber}
          code={verificationCode}
          setCode={setVerificationCode}
          inputError={invalidInputError}
          setInputError={setInvalidInputError}
        />
        <NotificationSuccessDialog
          open={openSuccessDialog}
          handleClose={handleCloseSuccessDialog}
        />
      </>
    );
  };

  //renders the back of the card displaying all subtopics for user to select
  const renderCardBack = () => {
    return (
      <Card>
        <CardHeader
          title={title}
          titleTypographyProps={{
            fontSize: "1.2rem",
            fontWeight: "400",
          }}
        />
        <CardContent sx={{ p: "16px 16px 0px 16px" }}>
          {userAlreadySubscribed ? (
            <FormGroup>
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
            <FormGroup>
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
    );
  };

  return (
    <div className={`card ${isRotated ? "rotated" : ""}`}>
      {!isRotated ? (
        <div className="front">{renderCardFront()}</div>
      ) : (
        <div className="back">{renderCardBack()}</div>
      )}
    </div>
  );
};

export default ViewTopicsCard;
