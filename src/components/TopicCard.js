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
import { Auth, API, graphqlOperation, Storage } from "aws-amplify"
import NotificationPreferencesDialog from "./NotificationPreferencesDialog";
import "./TopicCard.css";
import PhoneNumberDialog from "./PhoneNumberDialog";
import NotificationSuccessDialog from "./NotificationSuccessDialog";
import { getTopicsOfCategoryByAcronym, getUserByEmail } from "../graphql/queries";
import { updateUser } from "../graphql/mutations";

const TopicCard = ({
  selectedTopic,
  setSaveEnabled,
  selectedSubTopics,
  setSelectedSubtopics,
  allSelectedTopics,
  setAllSelectedTopics
}) => {
  const { title, description, picture_location } = selectedTopic;
  const initialNotificationSelection = { text: false, email: false };
  const [openNotificationDialog, setOpenNotificationDialog] = useState(false);
  const [openPhoneDialog, setOpenPhoneDialog] = useState(false);
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState(
    initialNotificationSelection
  );
  const [boxChecked, setBoxCheck] = useState([])
  const [alteredSubtopic, setAlteredSubtopic] = useState([])
  const [isRotated, setIsRotated] = useState(false);
  const [userPhone, setUserPhone] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [invalidInputError, setInvalidInputError] = useState(false)
  const [phoneDialogState, setPhoneDialogState] = useState("noPhone")
  const [subtopics, setSubtopics] = useState([])
  const [noTopicSelected, setNoTopicSelected] = useState(false)
  const [noPreferenceSelected, setNoPreferenceSelected] = useState(false)
  const [userID, setUserID] = useState("")
  const [user, setUser] = useState('')
  const [image, setImage] = useState('')

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
        setUser(returnedUser)
        let databaseUser = await API.graphql(graphqlOperation(getUserByEmail, { user_email: returnedUser.attributes.email }));
        let id = databaseUser.data.getUserByEmail.user_id
        setUserID(id)
        setUserPhone(returnedUser.attributes.phone_number)
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

  function checkPhone(num) {
    var regex = new RegExp(/\+1\d{10}/);
    if (regex.test(num)) return true;
    else return false;
  }

  const handleSavePhoneDialog = async () => {
    try {
      if (phoneDialogState === "noPhone") {
        if (phoneNumber === "" || !checkPhone(phoneNumber)) {
          setInvalidInputError(true)
        } else {
          await Auth.updateUserAttributes(user, {
            "phone_number": phoneNumber
          }).then(setPhoneDialogState("verifyPhone"))
        }
      } else if (phoneDialogState === "verifyPhone") {
        if (verificationCode === "") {
          setInvalidInputError(true)
        } else {
          await Auth.verifyCurrentUserAttributeSubmit(
            "phone_number",
            verificationCode
          ).then(async () => {
            await API.graphql(graphqlOperation(updateUser, {user_id: userID, phone_address: phoneNumber}));
            setPhoneDialogState("phoneSaved")
          })
        }
      } else {
        const allSelectedTopicsTemp = allSelectedTopics
        if (allSelectedTopicsTemp.filter((s) => s.category_acronym === selectedTopic.acronym).length === 0) {
          let splitSubtopics = []
          for (let x = 0; x < selectedSubTopics.length; x++) {
            let topicTitle = selectedSubTopics[x].split("/")
            splitSubtopics.push(topicTitle)
          }
          let subtopicsForThisTopic = splitSubtopics.filter((s) => s[0] === selectedTopic.title)
          for (let i = 0; i < subtopicsForThisTopic.length; i++) {
            let userSubscribeData = {
              user_id: userID,
              category_acronym: selectedTopic.acronym,
              topic_acronym: subtopicsForThisTopic[i][1],
              email_notice: selectedNotifications.email,
              sms_notice: selectedNotifications.text
            }
            setAllSelectedTopics(prev => [...prev, userSubscribeData])
          }
        } else {
          for (let i = 0; i < allSelectedTopicsTemp.length; i++) {
            if (allSelectedTopicsTemp[i].category_acronym === selectedTopic.acronym) {
              allSelectedTopicsTemp[i].email_notice = selectedNotifications.email
              allSelectedTopicsTemp[i].sms_notice = selectedNotifications.text
            }
          }
        }
        setOpenPhoneDialog(false);
        setOpenNotificationDialog(false)
      }
    } catch (e) {
      console.log(e)
      setInvalidInputError(true)
    }
  };

  const handleCloseNotificationDialog = () => {
    setNoTopicSelected(false)
    setNoPreferenceSelected(false)
    setOpenNotificationDialog(false);
  };

  const handleSaveNotificationDialog = () => {
    if (selectedNotifications.text && userPhone === undefined) {
      setOpenPhoneDialog(true)
    } else if (!selectedNotifications.text && !selectedNotifications.email) {
      setNoPreferenceSelected(true)
    } else if (selectedSubTopics.filter((s) => s.includes(selectedTopic.title)).length === 0) {
      setNoTopicSelected(true)
    } else {
      setNoTopicSelected(false)
      const allSelectedTopicsTemp = allSelectedTopics
      if (allSelectedTopicsTemp.filter((s) => s.category_acronym === selectedTopic.acronym).length === 0) {
        let splitSubtopics = []
        for (let x = 0; x < selectedSubTopics.length; x++) {
          let topicTitle = selectedSubTopics[x].split("/")
          splitSubtopics.push(topicTitle)
        }
        let subtopicsForThisTopic = splitSubtopics.filter((s) => s[0] === selectedTopic.title)
        for (let i = 0; i < subtopicsForThisTopic.length; i++) {
          let userSubscribeData = {
            user_id: userID,
            category_acronym: selectedTopic.acronym,
            topic_acronym: subtopicsForThisTopic[i][1],
            email_notice: selectedNotifications.email,
            sms_notice: selectedNotifications.text
          }
          setAllSelectedTopics(prev => [...prev, userSubscribeData])
        }
      } else {
        for (let i = 0; i < allSelectedTopicsTemp.length; i++) {
          if (allSelectedTopicsTemp[i].category_acronym === selectedTopic.acronym) {
            allSelectedTopicsTemp[i].email_notice = selectedNotifications.email
            allSelectedTopicsTemp[i].sms_notice = selectedNotifications.text
          }
        }
      }
      setOpenSuccessDialog(true)
    }  
  }

  const handleSaved = () => {
    setSaveEnabled(true)
    const allSelectedTopicsTemp = allSelectedTopics

    for (let x = 0; x < boxChecked.length; x++) {
      if (boxChecked[x] === false) {
        setAllSelectedTopics((prev) => prev.filter((s) => !(s.category_acronym === selectedTopic.acronym && s.topic_acronym === alteredSubtopic[x])))
      } else {
        for (let i = 0; i < allSelectedTopicsTemp.length; i++) {
          if (allSelectedTopicsTemp[i].category_acronym === selectedTopic.acronym) {
            let userSubscribeData = {
              user_id: userID,
              category_acronym: selectedTopic.acronym,
              topic_acronym: alteredSubtopic[x],
              email_notice: allSelectedTopicsTemp[i].email_notice,
              sms_notice: allSelectedTopicsTemp[i].sms_notice
            }
            setAllSelectedTopics(prev => [...prev, userSubscribeData])
            break;
          }
        }
      }
    } 
    setIsRotated(!isRotated)
  }

  const handleClosePhoneDialog = () => {
    setSelectedNotifications({text: false})
    setOpenPhoneDialog(false);
    setPhoneDialogState("noPhone")
  };

  const handleCloseSuccessDialog = () => {
    setOpenSuccessDialog(false)
    setOpenNotificationDialog(false)
  };

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

  const notificationsSelected = () => {
    const allSelectedTopicsTemp = allSelectedTopics
    if (allSelectedTopicsTemp.filter((s) => s.category_acronym === selectedTopic.acronym).length === 0) {
      return "Notifications Selected: None"
    } else {
      for (let i = 0; i < allSelectedTopicsTemp.length; i++) {
        if (allSelectedTopicsTemp[i].category_acronym === selectedTopic.acronym) {
          if (allSelectedTopicsTemp[i].email_notice && allSelectedTopicsTemp[i].sms_notice) {
            return "Notifications Selected: Email, Text"
          } else if (allSelectedTopicsTemp[i].email_notice && !allSelectedTopicsTemp[i].sms_notice) {
            return "Notifications Selected: Email"
          } else {
            return "Notifications Selected: Text"
          }
        }
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
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: "1.5em" }}
            >
              {notificationsSelected()}
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
              <IconButton
                aria-label="subscribe to topic"
                onClick={() => setOpenNotificationDialog(true)}
              >
                <NotificationsIcon />
              </IconButton>
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

export default TopicCard;
