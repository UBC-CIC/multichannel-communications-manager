import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { Alert } from "@mui/lab";
import { ArrowBack, AlternateEmail, Dialpad } from "@mui/icons-material";
import theme from "../../themes";
import { Auth } from "aws-amplify";
import { CognitoUser } from "amazon-cognito-identity-js";
import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { updateLoginState } from "../../actions/loginAction";
import TextFieldStartAdornment from "./TextFieldStartAdornment";
import "./Login.css";
import { styled } from "@mui/material/styles";
import SignUpStepper from "./SignUpStepper";
import SelectTopics from "./SelectTopics";
import ProfileCreationSuccess from "./ProfileCreationSuccess";

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
    darkMode,
    themeColor,
  } = props;
  const [formState, updateFormState] = useState(initialFormState);
  const [accountCreationEmailExistError, setAccountCreationEmailExistError] =
    useState(false);
  const [accountLoginError, setAccountLoginError] = useState(false);
  const [verificationError, setVerificationError] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState(false);
  const [newVerification, setNewVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [emptyInputError, setEmptyInputError] = useState(false);
  const [invalidEmailError, setInvalidEmailError] = useState(false);
  const [timeLimitError, setTimeLimitError] = useState("");
  const [cognitoUser, setCognitoUser] = useState();

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

  const [activeStep, setActiveStep] = useState(0);

  const handleNextStep = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBackStep = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleResetSteps = () => {
    setActiveStep(0);
  };

  const handleDisplayStep2 = () => {
    //add checks here to make sure form is filled out

    //sign user up
    signUp();

    updateLoginState("confirmSignUp");
    handleNextStep();
  };

  function clearErrors() {
    setAccountCreationEmailExistError(false);
    setAccountLoginError(false);
    setVerificationError(false);
    setNewVerification(false);
    setInvalidEmailError(false);
  }

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

  function onKeyDownSignIn(e) {
    if (e.keyCode === 13) {
      signIn();
    }
  }

  function onKeyDownSignUp(e) {
    if (e.keyCode === 13) {
      signUp();
    }
  }

  function getRandomString(bytes) {
    const randomValues = new Uint8Array(bytes);
    window.crypto.getRandomValues(randomValues);
    return Array.from(randomValues).map(intToHex).join("");
  }

  function intToHex(nr) {
    return nr.toString(16).padStart(2, "0");
  }

  async function signUp() {
    try {
      const { email, province, postal_code } = formState;

      setLoading(true);
      await Auth.signUp({
        username: email,
        password: getRandomString(30),
        attributes: {
          "custom:province": province,
          "custom:postal_code": postal_code,
        },
      });
      updateFormState(() => ({ ...initialFormState, email }));
      updateLoginState("confirmSignUp");
      setLoading(false);
    } catch (e) {
      setLoading(false);
      setEmptyInputError(false);

      const errorMsg = e.message;

      if (errorMsg.includes("empty")) {
        setEmptyInputError(true);
      } else if (errorMsg.includes("Username should be an email.")) {
        setInvalidEmailError(true);
      } else if (errorMsg.includes("given email already exists")) {
        setAccountCreationEmailExistError(true);
      }
    }
  }

  // async function resendConfirmationCode() {
  //   try {
  //     const { email } = formState;
  //     setVerificationError(false);
  //     await Auth.resendSignUp(email);
  //     setNewVerification(true);
  //   } catch (err) {
  //     setNewVerification(false);

  //     const errorMsg = err.message;
  //     if (errorMsg.includes("time")) {
  //       setTimeLimitError(errorMsg);
  //     }
  //   }
  // }

  // useEffect(() => {
  //   if (cognitoUser && formState.authCode) {
  //     console.log(cognitoUser, formState.authCode);
  //     answerCustomChallenge(cognitoUser);
  //   }
  // }, [cognitoUser, formState.authCode]);

  useEffect(() => {
    async function retrieveUser() {
      try {
        Auth.currentAuthenticatedUser()
          .then((user) => {
            updateLoginState("signedIn");
          })
          .catch((err) => {
            updateLoginState("signIn");
          });
      } catch (e) {}
    }
    retrieveUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function answerCustomChallenge() {
    // Send the answer to the User Pool
    // This will throw an error if it’s the 3rd wrong answer
    console.log(formState.authCode);
    await Auth.sendCustomChallengeAnswer(cognitoUser, formState.authCode);
    // It we get here, the answer was sent successfully,
    // but it might have been wrong (1st or 2nd time)
    // So we should test if the user is authenticated now
    try {
      // This will throw an error if the user is not yet authenticated:
      //not sure why the await Auth.currentSession() results in an error
      await Auth.currentSession();
      updateLoginState("signedIn");
    } catch (e) {
      // console.log("The user did not enter the right code");
      console.log(e);
    }
  }

  const verifyEmail = () => {
    console.log("in verifyEmail function", cognitoUser);
    console.log(cognitoUser);
    if (cognitoUser && formState.authCode) {
      console.log("going to answer custom challenge function");
      answerCustomChallenge();
    } else if (loginState === "confirmSignUp") {
      handleNextStep();
    }
    //confirm signup function will be uncommented after figuring out cognito integration
    // confirmSignUp();
  };

  useEffect(() => {
    cognitoUser && verifyEmail();
  }, [cognitoUser]);

  async function signIn() {
    try {
      console.log("in sign in function");
      const { email } = formState;
      updateLoginState("verifyEmail");
      setActiveStep(1);
      let currentUser = await Auth.signIn(email);
      setCognitoUser(currentUser);
    } catch (e) {
      setLoading(false);
      const errorMsg = e.code;
    }
  }

  // function checkEmptyString(str) {
  //   // check if string is empty after space trimmed
  //   if (str.replace(/\s+/g, "") === "") {
  //     throw new Error("empty");
  //   }
  // }

  function resetStates(state) {
    // resets the progress bar
    handleResetSteps();
    // clear states when hitting the back button
    updateFormState(() => initialFormState);
    clearErrors();

    // the following were not removed during onChange() so need to be cleared here
    setEmptyInputError(false);
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
                    ? "Welcome!"
                    : activeStep === 1 && "Email Verification"}
                </Typography>
                <span className={"login-wrapper-action-header"}>
                  {loginState === "signIn" ? (
                    <span>Sign In</span>
                  ) : loginState === "signUp" && activeStep === 0 ? (
                    <span>Please start by providing general information</span>
                  ) : loginState === "confirmSignUp" && activeStep === 1 ? (
                    <span>Verify Account</span>
                  ) : loginState === "forgotPassword" ? (
                    <span>Forgot your password?</span>
                  ) : loginState === "resetPassword" ? (
                    <span>Password Reset</span>
                  ) : loginState === "newUserPassword" ? (
                    <span>Set New Password</span>
                  ) : (
                    <span></span>
                  )}
                </span>
              </Grid>
            )}
            {loginState === "signIn" && (
              <Grid>
                <BannerMessage type={"error"} typeCheck={accountLoginError}>
                  Incorrect username or password.
                </BannerMessage>
                {/* username */}
                <TextFieldStartAdornment
                  startIcon={<AlternateEmail />}
                  placeholder={"Email"}
                  name={"email"}
                  type={"email"}
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
                    submitMessage={"Sign In"}
                    loadingState={loading}
                  />
                </Grid>
                <div>
                  {/* divider */}
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
                      Create an Account
                    </DefaultButton>
                  </Grid>
                </div>
              </Grid>
            )}

            {!!forgotPasswordError && (
              <Grid container item xs={12} sx={{ color: "red" }}>
                <span>
                  Please enter a valid email or create an account&nbsp;
                  <Box
                    component="span"
                    sx={{ cursor: "pointer", textDecoration: "underline" }}
                    onClick={() => updateLoginState("signUp")}
                  >
                    <strong>here</strong>
                  </Box>
                  <span>.</span>
                </span>
              </Grid>
            )}
            {/* General Information Sign Up Step */}
            {loginState === "signUp" && activeStep === 0 && (
              <Grid>
                <BannerMessage type={"error"} typeCheck={emptyInputError}>
                  Please fill in all fields.
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
                    label={"Email"}
                    name={"email"}
                    type="email"
                    error={accountCreationEmailExistError || invalidEmailError}
                    helperText={
                      (!!accountCreationEmailExistError &&
                        "An account with the given email already exists.") ||
                      (!!invalidEmailError && "Please enter a valid email.")
                    }
                    onChange={onChange}
                    onKeyDown={onKeyDownSignUp}
                  />
                  <Autocomplete
                    disablePortal
                    id={"province"}
                    options={provinceOptions}
                    renderInput={(params) => (
                      <TextField {...params} label="Province" />
                    )}
                    ListboxProps={{ style: { maxHeight: "7rem" } }}
                    onChange={onChange}
                  />
                  <TextFieldStartAdornment
                    startIcon={false}
                    label={"Postal Code"}
                    name={"postal_code"}
                    type="text"
                    onChange={onChange}
                    onKeyDown={onKeyDownSignUp}
                  />
                </Box>
                <BackAndSubmitButtons
                  backAction={() => resetStates("signIn")}
                  submitAction={handleDisplayStep2}
                  submitMessage={"Next"}
                  loadingState={loading}
                />
              </Grid>
            )}
            {/* Email Verification Sign Up Step */}
            {((loginState === "confirmSignUp" && activeStep === 1) ||
              loginState === "verifyEmail") && (
              <Grid>
                <Grid container item xs={12}>
                  <span>
                    Please check your email for a confirmation code. This may
                    take several minutes.
                  </span>
                </Grid>
                <BannerMessage type={"error"} typeCheck={verificationError}>
                  Invalid verification code provided, please try again.
                </BannerMessage>
                <BannerMessage type={"error"} typeCheck={timeLimitError !== ""}>
                  {timeLimitError}
                </BannerMessage>
                <BannerMessage type={"success"} typeCheck={newVerification}>
                  New verification code sent successfully.
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
                    placeholder="Enter your confirmation code."
                    name={"authCode"}
                    type="text"
                    autoComplete={"new-password"}
                    onChange={onChange}
                  />
                </Grid>
                <Grid>
                  <span>Didn't receive your verification code?</span>
                  {/* <Button onClick={resendConfirmationCode}>
                    <span>Resend Code</span>
                  </Button> */}
                  <Button>
                    <span>Resend Code</span>
                  </Button>
                </Grid>
                <BackAndSubmitButtons
                  backAction={() => resetStates("signUp")}
                  submitAction={
                    loginState === "confirmSignUp" ? verifyEmail : signIn
                  }
                  submitMessage={"Verify"}
                  loadingState={loading}
                />
              </Grid>
            )}
            {/* Select Topics of Interest Step*/}
            {activeStep === 2 && (
              <SelectTopics handleNextStep={handleNextStep} />
            )}

            {/* Redirect to Homepage Step*/}
            {activeStep === 3 && <ProfileCreationSuccess />}
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
          Back
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
