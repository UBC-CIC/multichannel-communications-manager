import { useEffect } from "react";
import { 
  Grid,
  Typography,
  TextField,
  Autocomplete,
  Button,
  Alert,
  Collapse,
  ToggleButton,
  ToggleButtonGroup
} from "@mui/material";
import { useState } from "react";
import { Auth, API, graphqlOperation } from "aws-amplify"
import useLeavingDialogPrompt from "../hooks/useLeavingDialogPrompt"
import { LeaveWithoutSavingDialog } from "../components/Dialog/LeaveWithoutSavingDialog";
import { getUserByEmail, getUserCategoryTopicByUserId } from "../graphql/queries";
import { updateUser, userUpdateChannelPrefrence } from "../graphql/mutations";
import EmailChangeDialog from "../components/Dialog/EmailChangeDialog";
import PhoneNumberDialog from "../components/Dialog/PhoneNumberDialog";
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/material.css'

const EditAccountInfo = () => {
  const provinceOptions = [
    "Alberta",
    "British Columbia",
    "Manitoba",
    "New Brunswick",
    "Newfoundland and Labrador",
    "Northwest Territories",
    "Nova Scotia",
    "Nunavut",
    "Ontario",
    "Prince Edward Island",
    "Quebec",
    "Saskatchewan",
    "Yukon",
  ];
  const [currentUser, setCurrentUser] = useState()
  const [userData, setUserData] = useState({});
  const [originalEmail, setOriginalEmail] = useState('');
  const [province, setProvince] = useState("")
  const [alert, setAlert] = useState(false);
  const [alertContent, setAlertContent] = useState('');
  const [emptyEmailError, setEmptyEmailError] = useState(false);
  const [invalidEmailError, setInvalidEmailError] = useState(false);
  const [emailExistError, setEmailExistError] = useState(false);
  const [invalidPostalCodeError, setInvalidPostalCodeError] = useState(false);
  const [canShowPrompt, setCanShowPrompt] = useState(false)
  const [showPrompt, confirmNav, cancelNav] = useLeavingDialogPrompt(canShowPrompt)
  const [openEmailConfirmDialog, setOpenEmailConfirmDialog] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [invalidInputError, setInvalidInputError] = useState(false);
  const [emailConfirmDialogState, setEmailConfirmDialogState] = useState("verifyEmail");
  const [defaultNotificationPreference, setDefaultNotificationPreference] = useState([]);
  const [defaultNotificationError, setDefaultNotificationError] = useState(false);
  const [openPhoneDialog, setOpenPhoneDialog] = useState(false)
  const [phoneDialogState, setPhoneDialogState] = useState("noPhone");
  const [phoneNumber, setPhoneNumber] = useState("");

  function convertAcronymToProvince(acronym) {
    let province;
    if (acronym === "AB") {
      province = "Alberta"
    } else if (acronym === "BC") {
      province = "British Columbia"
    } else if (acronym === "MB") {
      province = "Manitoba"
    } else if (acronym === "NB") {
      province = "New Brunswick"
    } else if (acronym === "NL") {
      province = "Newfoundland and Labrador"
    } else if (acronym === "NT") {
      province = "Northwest Territories"
    } else if (acronym === "NS") {
      province = "Nova Scotia"
    } else if (acronym === "NU") {
      province = "Nunavut"
    } else if (acronym === "ON") {
      province = "Ontario"
    } else if (acronym === "PE") {
      province = "Prince Edward Island"
    } else if (acronym === "QC") {
      province = "Quebec"
    } else if (acronym === "SK") {
      province = "Saskatchewan"
    } else {
      province = "Yukon"
    }
    return province
  }

  function convertProvinceToAcronym(province) {
    let acronym;
    if (province === "Alberta") {
      acronym = "AB"
    } else if (province === "British Columbia") {
      acronym = "BC"
    } else if (province === "Manitoba") {
      acronym = "MB"
    } else if (province === "New Brunswick") {
      acronym = "NB"
    } else if (province === "Newfoundland and Labrador") {
      acronym = "NL"
    } else if (province === "Northwest Territories") {
      acronym = "NT"
    } else if (province === "Nova Scotia") {
      acronym = "NS"
    } else if (province === "Nunavut") {
      acronym = "NU"
    } else if (province === "Ontario") {
      acronym = "ON"
    } else if (province === "Prince Edward Island") {
      acronym = "PE"
    } else if (province === "Quebec") {
      acronym = "QC"
    } else if (province === "Saskatchewan") {
      acronym = "SK"
    } else {
      acronym = "YT"
    }
    return acronym
  }

  async function getUserData() {
    try {
      const returnedUser = await Auth.currentAuthenticatedUser();
      setCurrentUser(returnedUser)
      setOriginalEmail(returnedUser.attributes.email)
      let user = await API.graphql(graphqlOperation(getUserByEmail, { user_email: returnedUser.attributes.email }));
      if (user.data.getUserByEmail.email_notice && user.data.getUserByEmail.sms_notice) {
        setDefaultNotificationPreference(['email', 'text'])
      } else if (user.data.getUserByEmail.email_notice) {
        setDefaultNotificationPreference(['email'])
      } else {
        setDefaultNotificationPreference(['text'])
      }
      setUserData(user.data.getUserByEmail)
      setProvince(convertAcronymToProvince(user.data.getUserByEmail.province))
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    getUserData();
  }, []);

  function checkPostal(postal) {
    var regex = new RegExp(/^[ABCEGHJKLMNPRSTVXY]\d[ABCEGHJKLMNPRSTVWXYZ]( )?\d[ABCEGHJKLMNPRSTVWXYZ]\d$/i);
    if (regex.test(postal))
      return true;
    else return false;
  }

  function checkEmail(mail) {
    var regex = new RegExp(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/);
    if (regex.test(mail))
      return true;
    else return false;
  }

  function clearErrors() {
    setDefaultNotificationError(false)
    setInvalidEmailError(false)
    setInvalidPostalCodeError(false)
    setEmptyEmailError(false)
    setEmailExistError(false)
  }

  function onChange(e, value) {
    e.persist()
    clearErrors();
    if (value) {
      //for updating dropdown fields
      setProvince(value);
      let provAcronym = convertProvinceToAcronym(value)
      setUserData({ ...userData, province: provAcronym });
      if (value !== province) {
        setCanShowPrompt(true)
      }
    } else {
      //for updating text box input fields
      setUserData({ ...userData, [e.target.name]: e.target.value });
      if (e.target.value !== userData[e.target.name]) {
        setCanShowPrompt(true)
      }
    }
  }

  const handlePhoneChange = (value) => {
    setUserData({ ...userData, phone_address: value });
    setCanShowPrompt(true)
  }

  function buttonClicked() {
    // Only check the postal code if the user has one entered
    if (userData.postal_code !== null) {
      if (!checkPostal(userData.postal_code)) {
        setInvalidPostalCodeError(true)
      }
    }
    if (userData.email_address === "") {
      setEmptyEmailError(true)
    } else if (defaultNotificationPreference.length === 0) {
      setDefaultNotificationError(true)
      setAlertContent('Please select your notification preferences.')
    } else if (!checkEmail(userData.email_address)) {
      setInvalidEmailError(true)
    } else {
      update()
    }
    setCanShowPrompt(false)
  }

  async function update() {
    let updateData = {
      email: userData.email_address,
      phone_number: "+" + userData.phone_address,
    }
    // If the user has not entered a phone number then we cannot
    // update it on Cognito
    if (userData.phone_address === null) {
      updateData = {
        email: userData.email_address,
      }
    } 
    // update the user in cognito
    await Auth.updateUserAttributes(currentUser, updateData)
    .then(successAlert)
    .catch((e) => {
      const errorMsg = e.errors[0].message
      if (errorMsg.includes("ER_DUP_ENTRY")) {
        setEmailExistError(true)
      }
    });
  }

  const handleToggle = (event, newToggle) => {
    clearErrors()
    // If the user hasn't entered their phone number before
    // they must verify it here
    if (newToggle.includes('text') && userData.phone_address === null) {
      setOpenPhoneDialog(true)
    } else {
      setDefaultNotificationPreference(newToggle);
    }
    setCanShowPrompt(true)
  };
  
  async function updateDatabase() {
    let email_selected, sms_selected = false
    if (defaultNotificationPreference.includes('email') && 
      defaultNotificationPreference.includes('text')) {
      email_selected = true
      sms_selected = true
    } else if (defaultNotificationPreference.includes('email')) {
      email_selected = true
      sms_selected = false
    } else {
      email_selected = false
      sms_selected = true
    }
    // If the user has changed their notification preferences, all the categories and topics
    // they are subscribed to need to be updated 
    if ((userData.email_notice !== email_selected) || (userData.sms_notice !== sms_selected)) {
      let getUserTopics = await API.graphql(graphqlOperation(getUserCategoryTopicByUserId, {
        user_id: userData.user_id
      }))
      let userTopics = getUserTopics.data.getUserCategoryTopicByUserId
      if (userTopics.length !== 0) {
        for (let i = 0; i < userTopics.length; i++) {
          await API.graphql(graphqlOperation(userUpdateChannelPrefrence, {
            user_id: userData.user_id,
            category_acronym: userTopics[i].category_acronym,
            topic_acronym: userTopics[i].topic_acronym,
            email_notice: email_selected,
            sms_notice: sms_selected
          }))
        }
      }
    }
    // update the user in the database
    userData.email_notice = email_selected
    userData.sms_notice = sms_selected
    await API.graphql(graphqlOperation(updateUser, userData))
    setAlert(true);
    setAlertContent('Your changes have been successfully saved.');
  }

  async function successAlert() {
    // If the user is changing their email then the new email must be verified
    if (originalEmail !== userData.email_address) {
      setOpenEmailConfirmDialog(true)
    } else {
      updateDatabase();
    }
  }

  const handleEmailConfirmDialog = async () => {
    if (emailConfirmDialogState === "verifyEmail") {
      if (verificationCode === "") {
        setInvalidInputError(true)
      } else {
        await Auth.verifyCurrentUserAttributeSubmit(
          "email",
          verificationCode
        )
        .then(() => {
          setEmailConfirmDialogState("emailUpdated");
        })
        .catch((e) => {
          setInvalidInputError(true);
        });
      }
    } else {
      // update all the user's changes after the new email has been verified
      updateDatabase()
      // update the user's credentials so that they can stay signed in after the email change
      await Auth.currentSession().then(await Auth.currentAuthenticatedUser({ bypassCache: true }))
    }
  };

  const handleSavePhoneDialog = async () => {
    try {
      if (phoneDialogState === "noPhone") {
        if (phoneNumber !== "") {
          await Auth.updateUserAttributes(currentUser, {
            "phone_number": "+" + phoneNumber
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
            await API.graphql(graphqlOperation(updateUser, {
              user_id: userData.user_id,
              phone_address: phoneNumber,
              email_notice: userData.email_notice,
              sms_notice: userData.sms_notice
            }));
            setPhoneDialogState("phoneSaved")
          })
        }
      } else {
        getUserData()
        setOpenPhoneDialog(false);
      }
    } catch (e) {
      setInvalidInputError(true)
    }
  };

  const handleClosePhoneDialog = () => {
    setOpenPhoneDialog(false);
    setPhoneNumber('')
    setInvalidInputError(false)
    setPhoneDialogState("noPhone")
  };

  return (
    <>
      {defaultNotificationError ? <Collapse in={defaultNotificationError}><Alert severity={"error"} onClose={() => setDefaultNotificationError(false)}>{alertContent}</Alert></Collapse> : <></> }
      {alert ? <Collapse in={alert}><Alert severity={"success"} onClose={() => setAlert(false)}>{alertContent}</Alert></Collapse> : <></> }
      <Grid
        container
        direction="column"
        style={{ minHeight: "80vh" }}
        >
          <LeaveWithoutSavingDialog
            showDialog={showPrompt}
            setShowDialog={setCanShowPrompt}
            confirmNavigation={confirmNav}
            cancelNavigation={cancelNav}
            />
          <Grid item>
            <Typography variant="h3" sx={{ mb: "1.5em" }}>
              Edit Account Information
            </Typography>
          </Grid>
          <Grid 
            container
            marginLeft={{ md: "25%"}}
            alignItems="center"
            justifyContent={"center"}
            marginBottom={2}
            gap={3}
            md={6}
            >
              <TextField
                fullWidth
                size="small"
                label={"Email"}
                InputLabelProps={{ shrink: true }}
                name={"email_address"}
                type="email"
                value={userData.email_address}
                error={emailExistError || invalidEmailError || emptyEmailError}
                helperText={
                  (!!emailExistError &&
                    "An account with the given email already exists.") ||
                  (!!invalidEmailError && "Please enter a valid email.") ||
                  (!!emptyEmailError && "This field cannot be empty.")
                }
                onChange={onChange}
              />
              {userData.phone_address !== null ?
                <PhoneInput
                  inputStyle={{width:'100%'}}
                  country={'ca'}
                  onlyCountries={["ca"]}
                  disableDropdown
                  countryCodeEditable={false}
                  value={userData.phone_address}
                  onChange={value => handlePhoneChange(value)}
                /> : <></>
              }
              <Autocomplete
                fullWidth
                size="small"
                disablePortal
                id={"province"}
                value={province || null}
                options={provinceOptions}
                renderInput={(params) => (
                  <TextField {...params} label="Province" InputLabelProps={{ shrink: true }} />
                )}
                ListboxProps={{ style: { maxHeight: "7rem" } }}
                onChange={onChange}
              />
              <TextField
                fullWidth
                size="small"
                label={"Postal Code"}
                value={userData.postal_code}
                InputLabelProps={{ shrink: true }}
                name={"postal_code"}
                error={invalidPostalCodeError}
                helperText={
                  (!!invalidPostalCodeError && "Please enter a valid postal code.")
                }
                type="text"
                onChange={onChange}
              />
              <ToggleButtonGroup
                fullWidth
                color="primary"
                size="small"
                value={defaultNotificationPreference}
                onChange={handleToggle}
                aria-label="text formatting"
              >
                <ToggleButton value="email" aria-label="email_notice">
                  Email Notifications
                </ToggleButton>
                <ToggleButton value="text" aria-label="sms_notice">
                  Text Notifications
                </ToggleButton>
              </ToggleButtonGroup>
              <Button variant="contained" fullWidth onClick={buttonClicked}>
                Save
              </Button>
          </Grid>
      </Grid>
      <EmailChangeDialog
        open={openEmailConfirmDialog}
        handleClose={() => {setInvalidInputError(false); setOpenEmailConfirmDialog(false)}}
        handleSave={handleEmailConfirmDialog}
        state={emailConfirmDialogState}
        email={userData.email_address}
        code={verificationCode}
        setCode={setVerificationCode}
        inputError={invalidInputError}
        setInputError={setInvalidInputError}
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

export default EditAccountInfo;
