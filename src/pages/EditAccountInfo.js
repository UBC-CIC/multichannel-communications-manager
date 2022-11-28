import { useEffect } from "react";
import { Grid, Typography, TextField, Autocomplete, Button } from "@mui/material";
import { useState } from "react";
import { Auth, API, graphqlOperation } from "aws-amplify"
import useLeavingDialogPrompt from "../hooks/useLeavingDialogPrompt"
import { LeaveWithoutSavingDialog } from "../components/LeaveWithoutSavingDialog";
import { getUserByEmail } from "../graphql/queries";

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

  const [userData, setUserData] = useState({});
  const [province, setProvince] = useState("")
  const [emptyEmailError, setEmptyEmailError] = useState(false);
  const [emptyPostalCodeError, setEmptyPostalCodeError] = useState(false);
  const [invalidEmailError, setInvalidEmailError] = useState(false);
  const [emailExistError, setEmailExist] = useState(false);
  const [invalidPostalCodeError, setInvalidPostalCodeError] = useState(false);
  const [invalidPhoneError, setInvalidPhoneError] = useState(false);
  const [canShowPrompt, setCanShowPrompt] = useState(false)
  const [showPrompt, confirmNav, cancelNav] = useLeavingDialogPrompt(canShowPrompt)

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

  useEffect(() => {
    async function retrieveUser() {
      try {
        const returnedUser = await Auth.currentAuthenticatedUser();
        let user = await API.graphql(graphqlOperation(getUserByEmail, { user_email: returnedUser.attributes.email }));
        setUserData(user.data.getUserByEmail)
        setProvince(convertAcronymToProvince(user.data.getUserByEmail.province))
      } catch (e) {
        console.log(e);
      }
    }
    retrieveUser();
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
    setInvalidEmailError(false)
    setInvalidPostalCodeError(false)
    setEmptyEmailError(false)
    setEmptyPostalCodeError(false)
  }

  function onChange(e, value) {
    e.persist()
    clearErrors();
    if (value) {
      //for updating dropdown fields
      setProvince(value);
      setUserData({ ...userData, province: value });
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

  function buttonClicked() {
    if (userData.email_address === "" || userData.postal_code === "") {
      if (userData.email_address === "") {
        setEmptyEmailError(true)
      } else {
        setEmptyPostalCodeError(true)
      }
    } else {
      if (!checkPostal(userData.postal_code)) {
        setInvalidPostalCodeError(true)
      }
      if (!checkEmail(userData.email_address)) {
        setInvalidEmailError(true)
      }
    }
    setCanShowPrompt(false)
  }

  async function updateUser() {
    const user = await Auth.currentAuthenticatedUser();
    await Auth.updateUserAttributes(user, {
      'email': userData.email_address,
      'custom:province': userData.province,
      'custom:postal_code': userData.postal_code
    });
  }

  return (
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
            <TextField
              fullWidth
              size="small"
              label={"Phone Number"}
              InputLabelProps={{ shrink: true }}
              name={"phone"}
              value={"userData.phone_address"}
              type="text"
              error={invalidPhoneError}
              helperText={
                (!!invalidPhoneError && "Please enter a valid phone number.")
              }
              onChange={onChange}
            />
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
              error={invalidPostalCodeError || emptyPostalCodeError}
              helperText={
                (!!invalidPostalCodeError && "Please enter a valid postal code.") ||
                (!!emptyPostalCodeError && "This field cannot be empty.")
              }
              type="text"
              onChange={onChange}
            />
        </Grid>
        <Grid container marginTop={3} marginLeft={{md: "42%"}} md={2}>
          <Button variant="contained" fullWidth onClick={buttonClicked}>
            Save
          </Button>
        </Grid>
    </Grid>
  );
};

export default EditAccountInfo;
