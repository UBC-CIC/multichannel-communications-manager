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
import { getTopicsOfCategoryByAcronym, getUserByEmail, getUserCategoryTopicByUserId } from "../../graphql/queries";
import { userFollowCategoryTopic, userUnfollowCategoryTopic } from "../../graphql/mutations";

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
  const [initialUserSelectedSubTopics, setInitialUserSelectedSubtopics] = useState([]);
  const [userSelectedSubTopics, setUserSelectedSubtopics] = useState([]);
  const [userUnfollow, setUserUnfollow] = useState([]);
  const [isRotated, setIsRotated] = useState(false);
  const [userPhone, setUserPhone] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [invalidInputError, setInvalidInputError] = useState(false);
  const [phoneDialogState, setPhoneDiologState] = useState("noPhone");
  const [user, setUser] = useState("");
  const [userID, setUserID] = useState("");
  const [subtopics, setSubtopics] = useState([]);
  const [userAlreadySubscribed, setUserAlreadySubscribed] = useState(false);
  const [userSubscribedNotifications, setUserSubscribedNotifications] = useState({})
  //example subtopics: these are hard coded for now but to be replaced with the queried subtopics for each topic of interest
  // const sampleSubtopics = [
  //   "COVID-19",
  //   "Subtopic 2",
  //   "Subtopic 3",
  //   "Subtopic 4",
  // ];
  // const userSubscribedSubtopics = {topic_acronym: ['Covid-19', 'Subtopic 2'], email_notice: true, sms_notice: false};
  // const userSubscribedSubtopics = null;

  async function getSubtopics(id) {
    let getUserSubscribed = await API.graphql(graphqlOperation(getUserCategoryTopicByUserId, {user_id: id}))
    let userSubscribedSubtopics = getUserSubscribed.data.getUserCategoryTopicByUserId
    if (userSubscribedSubtopics.filter((s) => s.category_acronym === selectedTopic.acronym).length !== 0) {
      let notifPreference = {
        email_notice: userSubscribedSubtopics[0].email_notice,
        sms_notice: userSubscribedSubtopics[0].sms_notice
      }
      setUserSubscribedNotifications(notifPreference)
      for (let i = 0; i < userSubscribedSubtopics.length; i++) {
        // setSubtopics([...subtopics, userSubscribedSubtopics[i].topic_acronym])
        setUserSelectedSubtopics((prev) => [...prev, userSubscribedSubtopics[i].topic_acronym]);
        setInitialUserSelectedSubtopics((prev) => [...prev, userSubscribedSubtopics[i].topic_acronym]);
      }
      // setSubtopics(userSubscribedSubtopics.topic_acronym);
      // setUserSelectedSubtopics(userSubscribedSubtopics.topic_acronym);
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
        setUser(returnedUser);
        setUserPhone(returnedUser.attributes.phoneNumber);
        let getUserId = await API.graphql(graphqlOperation(getUserByEmail, {
          user_email: returnedUser.attributes.email
        }))
        getSubtopics(getUserId.data.getUserByEmail.user_id);
        setUserID(getUserId.data.getUserByEmail.user_id)
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

  const handleSaveNotificationDialog = async () => {
    if (selectedNotifications.text && userPhone === undefined) {
      setOpenPhoneDialog(true);
    } else if (!selectedNotifications.text && !selectedNotifications.email) {
      setNoPreferenceSelected(true);
      setSelectedNotifications({ text: false, email: false });
    } else if (selectedSubTopics.length === 0) {
      setNoTopicSelected(true);
      setSelectedNotifications({ text: false, email: false });
    } else {
      for (let i = 0; i < selectedSubTopics.length; i++) {
        let userFollowData = {
          user_id: userID,
          category_acronym: selectedTopic.acronym,
          topic_acronym: selectedSubTopics[i],
          email_notice: selectedNotifications.email,
          sms_notice: selectedNotifications.text
        }
        await API.graphql(graphqlOperation(userFollowCategoryTopic, userFollowData))
      }
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
  
      if (newUserSelectedSubtopics.length !== 0) {
        for (let x = 0; x < newUserSelectedSubtopics.length; x++) {
          await API.graphql(graphqlOperation(userFollowCategoryTopic, {
            user_id: userID,
            category_acronym: selectedTopic.acronym,
            topic_acronym: newUserSelectedSubtopics[x],
            email_notice: userSubscribedNotifications.email_notice,
            sms_notice: userSubscribedNotifications.sms_notice
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
    setIsRotated(!isRotated);
  };

  function notificationPreferences() {
    if (userAlreadySubscribed) {
      if (
        userSubscribedNotifications.email_notice &&
        userSubscribedNotifications.sms_notice
      ) {
        return "Notifications Selected: Email, Text";
      } else if (
        userSubscribedNotifications.email_notice &&
        !userSubscribedNotifications.sms_notice
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
                View Topics
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
