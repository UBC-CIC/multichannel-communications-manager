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
  import { Auth } from "aws-amplify"
  import NotificationPreferencesDialog from "../NotificationPreferencesDialog";
  import "../TopicCard.css";
  import PhoneNumberDialog from "../PhoneNumberDialog";
  
  const ViewTopicsCard = ({
    selectedTopic,
    selectedSubTopics,
    setSelectedSubtopics,
  }) => {
    const { title, description, image } = selectedTopic;
    const initialNotificationSelection = { text: false, email: false };
    const [openNotificationDialog, setOpenNotificationDialog] = useState(false);
    const [openPhoneDialog, setOpenPhoneDialog] = useState(false);
    const [selectedNotifications, setSelectedNotifications] = useState(
      initialNotificationSelection
    );
    const [isRotated, setIsRotated] = useState(false);
    const [userPhone, setUserPhone] = useState("")
    const [phoneNumber, setPhoneNumber] = useState("")
    const [verificationCode, setVerificationCode] = useState("")
    const [invalidInputError, setInvalidInputError] = useState(false)
    const [phoneDialogState, setPhoneDiologState] = useState("noPhone")
    const [user, setUser] = useState("")
    //example subtopics: these are hard coded for now but to be replaced with the queried subtopics for each topic of interest
    const subtopics = ["COVID-19", "Subtopic 2", "Subtopic 3", "Subtopic 4"];
  
    useEffect(() => {
      async function retrieveUser() {
        try {
          const returnedUser = await Auth.currentAuthenticatedUser();
          setUser(returnedUser)
          setUserPhone(returnedUser.attributes.phoneNumber)
        } catch (e) {
          console.log(e);
        }
      }
      retrieveUser();
    }, []);
  
    function checkPhone(num) {
      var regex = new RegExp(/\(?([0-9]{3})\)?([ .-]?)([0-9]{3})\2([0-9]{4})/);
      if (regex.test(num))
        return true;
      else return false;
    }
  
    const handleSavePhoneDialog = async () => {
      if (phoneDialogState === "noPhone") {
        await Auth.updateUserAttributes(user, {
          phone_number: phoneNumber,
        })
          .then(async () => {
            await Auth.verifyCurrentUserAttribute("phone_number")
            setPhoneDiologState("verifyPhone")
          })
          .catch((e) => {
            console.log(e)
            setInvalidInputError(e.message)
          })
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
        await Auth.verifyCurrentUserAttributeSubmit('phone_number', verificationCode)
          .then(() => {
            console.log('phone number verified');
            setPhoneDiologState("phoneSaved")
          }).catch((e) => {
            console.log('failed with error', e);
            setInvalidInputError(true)
          });
        // }
      } else {
        setOpenPhoneDialog(false)
      }
    }
  
    const handleCloseNotificationDialog = () => {
      setOpenNotificationDialog(false);
    };
  
    const handleSaveNotificationDialog = () => {
      if (selectedNotifications.text && userPhone === undefined) {
        setOpenPhoneDialog(true)
      }
    }
  
    const handleClosePhoneDialog = () => {
      setSelectedNotifications({text: false})
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
                Notifications selected:{" "}
                {Object.values(selectedNotifications).some((val) => val === true)
                  ? Object.keys(selectedNotifications)
                      .filter(function (key) {
                        return selectedNotifications[key];
                      })
                      .map(String)
                  : "None"}
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
              <Button sx={{ mr: "1em" }} onClick={() => setIsRotated(!isRotated)}>
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