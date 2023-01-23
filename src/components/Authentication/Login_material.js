import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  TextField,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from "@mui/material";
import { Alert } from "@mui/lab";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/high-res.css";
import {
  ArrowBack,
  AlternateEmail,
  Dialpad,
  HelpOutline,
} from "@mui/icons-material";
import theme from "../../themes";
import { Auth, API, graphqlOperation } from "aws-amplify";
import { createUser } from "../../graphql/mutations";
import { useState } from "react";
import { connect } from "react-redux";
import { updateLoginState } from "../../actions/loginAction";
import TextFieldStartAdornment from "./TextFieldStartAdornment";
import "./Login.css";
import { styled } from "@mui/material/styles";
import SignUpStepper from "./SignUpStepper";
import SelectTopics from "./SelectTopics";
import ProfileCreationSuccess from "./ProfileCreationSuccess";
import { I18n } from "aws-amplify";

const initialFormState = {
  email: "",
  province: "",
  postal_code: "",
  authCode: "",
  resetCode: "",
};

const SubmitButton = styled(Button)`
  border-radius: 50px;
  width: 100%;
  font-size: 1em;
  padding: ${theme.spacing(1.5)};
  margin: ${theme.spacing(2, "auto")};
  color: ${theme.palette.getContrastText("#012144")};
  background-color: #012144;
`;

const DefaultButton = styled(Button)`
  border-radius: 50px;
  width: 100%;
  font-size: 1em;
  padding: ${theme.spacing(1.5)};
  margin: ${theme.spacing(2, "auto")};
  background-color: #e0e0e0;
  color: rgba(0, 0, 0, 0.87);
  &:hover {
    background-color: #d5d5d5;
    box-shadow: 0px 2px 4px -1px rgb(0 0 0 / 20%),
      0px 4px 5px 0px rgb(0 0 0 / 14%), 0px 1px 10px 0px rgb(0 0 0 / 12%);
  }
`;

function Login(props) {
  const {
    loginState,
    updateLoginState,
    animateTitle,
    type,
    title,
    language,
    setLanguage,
    darkMode,
    themeColor,
  } = props;
  const [formState, updateFormState] = useState(initialFormState);
  const [accountCreationEmailExistError, setAccountCreationEmailExistError] =
    useState(false);
  const [accountLoginError, setAccountLoginError] = useState(false);
  const [verificationError, setVerificationError] = useState(false);
  const [newVerification, setNewVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputsNotFilled, setInputsNotFilled] = useState(false);
  const [userExistError, setUserExistError] = useState(false);
  const [invalidPostalCodeError, setInvalidPostalCodeError] = useState(false);
  const [invalidEmailError, setInvalidEmailError] = useState(false);
  const [emptyAuthCode, setEmptyAuthCode] = useState(false);
  const [timeLimitError, setTimeLimitError] = useState("");
  const [defaultNotificationError, setDefaultNotificationError] =
    useState(false);
  const [cognitoUser, setCognitoUser] = useState();
  const [defaultNotificationPreference, setDefaultNotificationPreference] =
    useState([]);
  const [userPhone, setUserPhone] = useState("");
  const [invalidInputError, setInvalidInputError] = useState(false);
  // const [language, setLanguage] = useState(
  //   navigator.language === "fr" || navigator.language.startsWith("fr")
  //     ? "fr"
  //     : "en"
  // );

  const provinceOptions = [
    I18n.get("bc"),
    I18n.get("ab"),
    I18n.get("mb"),
    I18n.get("nb"),
    I18n.get("nl"),
    I18n.get("nt"),
    I18n.get("ns"),
    I18n.get("nu"),
    I18n.get("on"),
    I18n.get("pe"),
    I18n.get("qc"),
    I18n.get("sk"),
    I18n.get("yt"),
  ];

  const [activeStep, setActiveStep] = useState(0);

  const handleNextStep = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleResetSteps = () => {
    setActiveStep(0);
  };

  function checkPostal(postal) {
    var regex = new RegExp(
      /^[ABCEGHJKLMNPRSTVXY]\d[ABCEGHJKLMNPRSTVWXYZ]( )?\d[ABCEGHJKLMNPRSTVWXYZ]\d$/i
    );
    if (regex.test(postal)) return true;
    else return false;
  }

  const handleDisplayStep2 = () => {
    // only check the postal code if the user enters it
    if (formState.postal_code !== "") {
      if (!checkPostal(formState.postal_code)) {
        setInvalidPostalCodeError(true);
      }
    }
    if (formState.email === "" || formState.province === "") {
      setInputsNotFilled(true);
    } else if (defaultNotificationPreference.length === 0) {
      setDefaultNotificationError(true);
    } else {
      if (defaultNotificationPreference.includes("text")) {
        if (userPhone === "") {
          setInvalidInputError(true);
        } else {
          signUp();
        }
      } else {
        signUp();
      }
    }
  };

  function clearErrors() {
    setAccountCreationEmailExistError(false);
    setAccountLoginError(false);
    setVerificationError(false);
    setNewVerification(false);
    setInvalidEmailError(false);
    setInvalidPostalCodeError(false);
    setInputsNotFilled(false);
    setEmptyAuthCode(false);
    setUserExistError(false);
    setDefaultNotificationError(false);
    setInvalidInputError(false);
  }

  //updates province dropdown value or text box input fields for the General Information form step
  function onChange(e, value) {
    e.persist();
    clearErrors();
    if (value) {
      //for updating dropdown fields
      updateFormState({ ...formState, province: value });
    } else {
      //for updating text box input fields
      updateFormState({ ...formState, [e.target.name]: e.target.value });
    }
  }

  const handleToggle = (event, newToggle) => {
    clearErrors();
    setDefaultNotificationPreference(newToggle);
  };

  function onKeyDownSignIn(e) {
    if (e.keyCode === 13) {
      if (e.target.value === "") {
        setInvalidEmailError(true);
      } else {
        signIn();
      }
    }
  }

  /*functions for user sign up process*/

  /*functions for creating randomly generated password*/
  function getRandomString(bytes) {
    const randomValues = new Uint8Array(bytes);
    window.crypto.getRandomValues(randomValues);
    return Array.from(randomValues).map(intToHex).join("");
  }

  function intToHex(nr) {
    return nr.toString(16).padStart(2, "0");
  }

  function handleLanguageChange() {
    I18n.setLanguage(language === "fr" ? "en" : "fr");

    setLanguage((prev) => {
      return prev === "fr" ? "en" : "fr";
    });
  }

  //function for user sign up
  async function signUp() {
    try {
      const { email } = formState;
      let data;
      setLoading(true);
      if (userPhone === "") {
        data = await Auth.signUp({
          username: email,
          password: getRandomString(30),
          autoSignIn: {
            enabled: true,
          },
        });
      } else {
        data = await Auth.signUp({
          username: email,
          password: getRandomString(30),
          attributes: {
            phone_number: "+" + userPhone,
          },
          autoSignIn: {
            enabled: true,
          },
        });
      }
      setCognitoUser(data.user);
      setLoading(false);
      updateLoginState("confirmSignUp");
      handleNextStep();
    } catch (e) {
      setLoading(false);
      const errorMsg = e.message;
      if (errorMsg.includes("empty")) {
        setInputsNotFilled(true);
      } else if (errorMsg.includes("Username should be an email.")) {
        setInvalidEmailError(true);
      } else if (errorMsg.includes("given email already exists")) {
        setAccountCreationEmailExistError(true);
      }
    }
  }

  //function to resend confirmation code if user did not receive it or if the email timed out
  async function resendConfirmationCode() {
    try {
      const { email } = formState;
      setVerificationError(false);
      await Auth.resendSignUp(email);
      setNewVerification(true);
    } catch (err) {
      setNewVerification(false);
      const errorMsg = err.message;
      if (errorMsg.includes("time")) {
        setTimeLimitError(errorMsg);
      }
    }
  }

  /* functions for user email verification */

  //sends user inputted email confirmation code to user pool to verify
  async function answerCustomChallenge() {
    // Send the answer to the User Pool
    // This will throw an error if it’s the 3rd wrong answer
    try {
      await Auth.sendCustomChallengeAnswer(cognitoUser, formState.authCode);
    } catch (e) {
      const errorMsg = e.message;
      if (errorMsg.includes("Incorrect username or password.")) {
        updateLoginState("signIn");
        setAccountLoginError(true);
      }
    }
    // If we get here, the answer was sent successfully,
    // but it might have been wrong (1st or 2nd time)
    // So we should test if the user is authenticated now
    try {
      // This will throw an error if the user is not yet authenticated:
      let user = await Auth.currentAuthenticatedUser();
      // This will check if the user is an admin or not
      let group = user.signInUserSession.accessToken.payload["cognito:groups"];
      if (group === undefined) {
        updateLoginState("signedIn");
      } else {
        if (group.includes("Admins")) {
          updateLoginState("Admin");
        }
      }
    } catch (e) {
      console.log("e", e);
      const errorMsg = e.message;
      if (
        errorMsg.includes("No current user")
        // ||
        // e.includes("The user is not authenticated")
      ) {
        setVerificationError(true);
      }
    }
  }

  function convertProvinceToAcronym(province) {
    let acronym;
    if (province === I18n.get("ab")) {
      acronym = "AB";
    } else if (province === I18n.get("bc")) {
      acronym = "BC";
    } else if (province === I18n.get("mb")) {
      acronym = "MB";
    } else if (province === I18n.get("nb")) {
      acronym = "NB";
    } else if (province === I18n.get("nl")) {
      acronym = "NL";
    } else if (province === I18n.get("nt")) {
      acronym = "NT";
    } else if (province === I18n.get("ns")) {
      acronym = "NS";
    } else if (province === I18n.get("nu")) {
      acronym = "NU";
    } else if (province === I18n.get("on")) {
      acronym = "ON";
    } else if (province === I18n.get("pe")) {
      acronym = "PE";
    } else if (province === I18n.get("qc")) {
      acronym = "QC";
    } else if (province === I18n.get("sk")) {
      acronym = "SK";
    } else {
      acronym = "YT";
    }
    return acronym;
  }

  const verifyEmail = async () => {
    if (formState.authCode === "") {
      setEmptyAuthCode(true);
    } else {
      //the following if block runs during user sign up
      if (loginState === "confirmSignUp" && formState.authCode) {
        // confirm sign up
        // After retrieveing the confirmation code from the user
        Auth.confirmSignUp(cognitoUser.username, formState.authCode, {
          // Optional. Force user confirmation irrespective of existing alias. By default set to True.
          forceAliasCreation: true,
        })
          .then(async (data) => {
            let prov = convertProvinceToAcronym(formState.province);
            let email_selected,
              sms_selected = false;
            if (
              defaultNotificationPreference.includes("email") &&
              defaultNotificationPreference.includes("text")
            ) {
              email_selected = true;
              sms_selected = true;
            } else if (defaultNotificationPreference.includes("email")) {
              email_selected = true;
              sms_selected = false;
            } else {
              email_selected = false;
              sms_selected = true;
            }
            const userData = {
              email_address: formState.email,
              phone_address: userPhone,
              postal_code: formState.postal_code,
              province: prov,
              email_notice: email_selected,
              sms_notice: sms_selected,
              // todo
              language: language,
            };
            await API.graphql(graphqlOperation(createUser, userData));
            handleNextStep();
          })
          .catch((e) => {
            const errorMsg = e.message;
            console.log(e);
            if (errorMsg.includes("invalidVerificationCode")) {
              setVerificationError(true);
            }
          });
      }
      //the following if block runs during user sign in
      if (loginState === "verifyEmail" && cognitoUser && formState.authCode) {
        answerCustomChallenge();
      }
    }
  };

  /* functions for user sign in */
  async function signIn() {
    try {
      setLoading(true);
      const { email } = formState;
      if (email === "") {
        setInvalidEmailError(true);
      } else {
        let currentUser = await Auth.signIn(email);
        setCognitoUser(currentUser);
        updateLoginState("verifyEmail");
        setActiveStep(1);
      }
      setLoading(false);
    } catch (e) {
      setLoading(false);
      const errorMsg = e.message;
      if (errorMsg.includes("User does not exist.")) {
        setUserExistError(true);
      }
    }
  }

  //resets progress bar and form states
  function resetStates(state) {
    // resets the progress bar
    handleResetSteps();
    // clear states when hitting the back button
    updateFormState(() => initialFormState);
    clearErrors();

    // the following were not removed during onChange() so need to be cleared here
    setTimeLimitError("");

    updateLoginState(state);
  }

  return (
    <>
      <Grid
        container
        sx={{ justifyContent: "center", alignItems: "center" }}
        style={
          type === "image"
            ? themeColor === "standard"
              ? {
                  backgroundColor: "#012144",
                  backgroundImage: "url(./assets/images/background.jpg)",
                  backgroundSize: "cover",
                  backgroundRepeat: "no",
                  width: "100%",
                  height: "100vh",
                }
              : {
                  backgroundColor: themeColor,
                  backgroundImage: "url(./assets/images/background.jpg)",
                  backgroundSize: "cover",
                  backgroundRepeat: "no",
                  width: "100%",
                  height: "100vh",
                }
            : themeColor === "standard"
            ? { backgroundColor: "#012144", width: "100%", height: "100vh" }
            : { backgroundColor: themeColor, width: "100%", height: "100vh" }
        }
      >
        <Grid
          container
          item
          xs={12}
          md={5}
          sx={{
            justifyContent: "center",
            alignItems: "center",
            width: "100px",
          }}
        >
          <Grid
            container
            item
            sx={{
              justifyContent: "space-evenly",
              alignItems: "center",
            }}
          >
            {/* display progress bar for sign up steps if login state is sign up */}
            {loginState === "signUp" || loginState === "confirmSignUp" ? (
              <SignUpStepper activeStep={activeStep} />
            ) : (
              <Grid
                xs
                item
                className={`typewriter`}
                sx={{ margin: theme.spacing(4, "auto") }}
              >
                <Typography
                  sx={{ textAlign: "center" }}
                  className={`${
                    animateTitle
                      ? darkMode
                        ? "line anim-typewriter"
                        : "line anim-typewriter-light lightMode"
                      : darkMode
                      ? "line-static"
                      : "line-static lightMode-static"
                  }`}
                >
                  {title}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Grid>
        <Grid
          container
          item
          xs={12}
          sm={7}
          sx={{ justifyContent: "center", alignItems: "center" }}
        >
          <div style={{ position: "absolute", top: "0", right: "0" }}>
            <Button onClick={handleLanguageChange}>
              {language === "fr" ? "English" : "Français"}
            </Button>
          </div>
          {/* second box */}
          <Grid
            container
            item
            xs={12}
            sm={11}
            md={9}
            className={"login-box"}
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            {activeStep !== 2 && (
              <Grid className={"login-wrapper-top"}>
                <Typography
                  sx={{ mb: "1em" }}
                  className={"login-wrapper-top-header"}
                >
                  {activeStep === 0
                    ? I18n.get("welcome")
                    : activeStep === 1 && I18n.get("verification")}
                </Typography>
                <span className={"login-wrapper-action-header"}>
                  {loginState === "signIn" ? (
                    <span>{I18n.get("signIn")}</span>
                  ) : loginState === "signUp" && activeStep === 0 ? (
                    <span>{I18n.get("profilePrompt")}</span>
                  ) : loginState === "confirmSignUp" && activeStep === 1 ? (
                    <span>{I18n.get("verifyAccount")}</span>
                  ) : loginState === "forgotPassword" ? (
                    <span>{I18n.get("forgotpassword")}</span>
                  ) : (
                    <span></span>
                  )}
                </span>
              </Grid>
            )}
            {loginState === "signIn" && (
              <Grid>
                <BannerMessage type={"error"} typeCheck={userExistError}>
                  User does not exist.
                </BannerMessage>
                <BannerMessage type={"error"} typeCheck={accountLoginError}>
                  {I18n.get("userNone")}
                </BannerMessage>
                {/* username */}
                <TextFieldStartAdornment
                  startIcon={<AlternateEmail />}
                  placeholder={I18n.get("email")}
                  name={"email"}
                  type={"email"}
                  error={accountCreationEmailExistError || invalidEmailError}
                  helperText={!!invalidEmailError && I18n.get("invalidEmail")}
                  onChange={onChange}
                  onKeyDown={onKeyDownSignIn}
                />
                <Grid
                  className={`input-box`}
                  sx={{ margin: theme.spacing(4, "auto", "auto", "auto") }}
                >
                  {" "}
                  {/* sign in button */}
                  <SubmitButtonWithLoading
                    submitAction={signIn}
                    submitMessage={I18n.get("signIn")}
                    loadingState={loading}
                  />
                </Grid>
                <div>
                  <Grid container item alignItems="center" xs={12}>
                    <Grid item xs>
                      <Divider />
                    </Grid>
                    <Grid item sx={{ padding: theme.spacing(1.5) }}>
                      Or
                    </Grid>
                    <Grid item xs>
                      <Divider />
                    </Grid>
                  </Grid>
                  {/* create an account button */}
                  <Grid className={`input-box`}>
                    <DefaultButton
                      variant="contained"
                      onClick={() => resetStates("signUp")}
                    >
                      {I18n.get("createAccount")}
                    </DefaultButton>
                  </Grid>
                </div>
              </Grid>
            )}
            {/* General Information Sign Up Step */}
            {loginState === "signUp" && activeStep === 0 && (
              <Grid>
                <BannerMessage type={"error"} typeCheck={inputsNotFilled}>
                  {I18n.get("missingRequiredField")}
                </BannerMessage>
                <BannerMessage
                  type={"error"}
                  typeCheck={defaultNotificationError}
                >
                  {I18n.get("missingNoticePreference")}
                </BannerMessage>
                <BannerMessage type={"error"} typeCheck={invalidInputError}>
                  {I18n.get("invalidPhone")}
                </BannerMessage>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1em",
                    mb: "2em",
                  }}
                >
                  <TextFieldStartAdornment
                    startIcon={false}
                    label={I18n.get("email") + " *"}
                    name={"email"}
                    type="email"
                    error={accountCreationEmailExistError || invalidEmailError}
                    helperText={
                      (!!accountCreationEmailExistError &&
                        I18n.get("accountExistsErr")) ||
                      (!!invalidEmailError && I18n.get("invalidEmail"))
                    }
                    onChange={onChange}
                  />
                  <Autocomplete
                    disablePortal
                    id={"province"}
                    options={provinceOptions}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={I18n.get("province") + " *"}
                      />
                    )}
                    ListboxProps={{ style: { maxHeight: "7rem" } }}
                    onChange={onChange}
                  />
                  <TextFieldStartAdornment
                    startIcon={false}
                    label={I18n.get("postalCode")}
                    name={"postal_code"}
                    error={invalidPostalCodeError}
                    helperText={
                      !!invalidPostalCodeError && I18n.get("invalidPostalCode")
                    }
                    type="text"
                    onChange={onChange}
                  />
                  <Box sx={{ display: "flex", flexDirection: "row", gap: 1 }}>
                    <Tooltip
                      title="This is how you will receive notifications for the topics you subscribe to.
                    It can be changed at any time."
                    >
                      <HelpOutline />
                    </Tooltip>
                    <span>{I18n.get("notifPreferencePrompt")}</span>
                  </Box>
                  <ToggleButtonGroup
                    color="primary"
                    size="small"
                    value={defaultNotificationPreference}
                    onChange={handleToggle}
                    aria-label="text formatting"
                  >
                    <ToggleButton value="email" aria-label="email_notice">
                      {I18n.get("emailNotice")}
                    </ToggleButton>
                    <ToggleButton value="text" aria-label="sms_notice">
                      {I18n.get("textNotice")}
                    </ToggleButton>
                  </ToggleButtonGroup>
                  {defaultNotificationPreference.includes("text") ? (
                    <PhoneInput
                      country={"ca"}
                      onlyCountries={["ca"]}
                      disableDropdown
                      countryCodeEditable={false}
                      value={userPhone}
                      onChange={(value) => setUserPhone(value)}
                    />
                  ) : (
                    <></>
                  )}
                </Box>
                <BackAndSubmitButtons
                  backAction={() => resetStates("signIn")}
                  submitAction={handleDisplayStep2}
                  submitMessage={I18n.get("next")}
                  loadingState={loading}
                />
              </Grid>
            )}
            {/* Email Verification Sign Up Step */}
            {((loginState === "confirmSignUp" && activeStep === 1) ||
              loginState === "verifyEmail") && (
              <Grid>
                {loginState === "verifyEmail" ? (
                  <span>{I18n.get("checkEmailVerification")}</span>
                ) : (
                  <Grid container item xs={12}>
                    <span>{I18n.get("confirmationNote")}</span>
                    <br />
                    <span>
                      <strong>{I18n.get("note")}</strong>
                      {I18n.get("emailNote")}
                    </span>
                  </Grid>
                )}
                <BannerMessage type={"error"} typeCheck={verificationError}>
                  {I18n.get("invalidVerificationCode")}
                </BannerMessage>
                <BannerMessage type={"error"} typeCheck={timeLimitError !== ""}>
                  {timeLimitError}
                </BannerMessage>
                <BannerMessage type={"success"} typeCheck={newVerification}>
                  {I18n.get("newVerifyCodeSent")}
                </BannerMessage>
                <Grid
                  container
                  item
                  direction={"column"}
                  xs={12}
                  className={"input-box"}
                >
                  <TextFieldStartAdornment
                    startIcon={<Dialpad />}
                    placeholder={I18n.get("verifyCodePrompt")}
                    name={"authCode"}
                    error={emptyAuthCode}
                    helperText={!!emptyAuthCode && I18n.get("emptyFieldErr")}
                    type="text"
                    autoComplete={"new-password"}
                    onChange={onChange}
                  />
                </Grid>
                <Grid>
                  <span>{I18n.get("verifyCodePrompt")}</span>
                  <Button onClick={resendConfirmationCode}>
                    <span>{I18n.get("resendCode")}</span>
                  </Button>
                </Grid>
                <BackAndSubmitButtons
                  backAction={() => resetStates("signUp")}
                  submitAction={verifyEmail}
                  submitMessage={I18n.get("verify")}
                  loadingState={loading}
                />
              </Grid>
            )}
            {/* Select Topics of Interest Step*/}
            {activeStep === 2 && (
              <SelectTopics
                handleNextStep={handleNextStep}
                language={language}
              />
            )}

            {/* Redirect to Homepage Step*/}
            {activeStep === 3 && (
              <ProfileCreationSuccess
                login={() => updateLoginState("signedIn")}
              />
            )}
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}

/* helper components */

const BannerMessage = (props) => {
  const { type, typeCheck, children } = props;
  return (
    <Grid>
      {!!typeCheck && (
        <Grid container item xs={12}>
          <Alert
            variant="filled"
            severity={type}
            elevation={3}
            sx={{ width: "100%", margin: theme.spacing(2, "auto") }}
          >
            {children}
          </Alert>
        </Grid>
      )}
    </Grid>
  );
};

const SubmitButtonWithLoading = (props) => {
  const { submitAction, submitMessage, loadingState } = props;

  return (
    <SubmitButton
      variant="contained"
      disabled={!!loadingState}
      onClick={submitAction}
    >
      {submitMessage}
      {/* if it is loading, show the loading indicator */}
      {!!loadingState && (
        <Grid sx={{ display: "flex", padding: theme.spacing(0, 1) }}>
          <CircularProgress size={15} />
        </Grid>
      )}
    </SubmitButton>
  );
};

const BackAndSubmitButtons = ({ backAction, ...others }) => {
  return (
    <Grid container item xs={12} justify="space-between" spacing={1}>
      <Grid container item xs>
        <DefaultButton
          variant="contained"
          startIcon={<ArrowBack />}
          onClick={backAction}
        >
          {I18n.get("back")}
        </DefaultButton>
      </Grid>
      <Grid container item md={7} justify={"flex-end"}>
        <SubmitButtonWithLoading {...others} />
      </Grid>
    </Grid>
  );
};

const mapStateToProps = (state) => {
  return {
    loginState: state.loginState.currentState,
  };
};

const mapDispatchToProps = {
  updateLoginState,
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
