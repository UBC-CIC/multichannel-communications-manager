import React from "react";
import { Grid, Typography, TextField, Autocomplete, Button } from "@mui/material";
import { useState } from "react";
import useLeavingDialogPrompt from "../hooks/useLeavingDialogPrompt"
import { LeaveWithoutSavingDialog } from "../components/LeaveWithoutSavingDialog";

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

  const [email, setEmail] = useState("email")
  const [phone, setPhone] = useState("phone")
  const [province, setProvince] = useState("province")
  const [postalCode, setPostalCode] = useState("postal")
  const [canShowPrompt, setCanShowPrompt] = useState(false)
  const [showPrompt, confirmNav, cancelNav] = useLeavingDialogPrompt(canShowPrompt)

  function checkPostal(postal) {
    var regex = new RegExp(/^[ABCEGHJKLMNPRSTVXY]\d[ABCEGHJKLMNPRSTVWXYZ]( )?\d[ABCEGHJKLMNPRSTVWXYZ]\d$/i);
    if (regex.test(postal))
      return true;
    else return false;
  }

  function checkEmail(mail) {
    var regex = new RegExp(/^([\w\.\-]+)@([\w\-]+)((\.(\w){2,3})+)$/g);
    if (regex.test(mail))
      return true;
    else return false;
  }

  function onChange(e, value) {
    setEmail(e.target.value)
    if (e.target.value !== email) {
      setCanShowPrompt(true)
    } else {
      setCanShowPrompt(false)
    }
  }

  function buttonClicked() {
    setCanShowPrompt(false)
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
              name={"email"}
              type="email"
              value={email}
              // error={accountCreationEmailExistError || invalidEmailError}
              // helperText={
              //   (!!accountCreationEmailExistError &&
              //     "An account with the given email already exists.") ||
              //   (!!invalidEmailError && "Please enter a valid email.")
              // }
              onChange={onChange}
            />
            <TextField
              fullWidth
              size="small"
              label={"Phone Number"}
              InputLabelProps={{ shrink: true }}
              name={"phone"}
              value={phone}
              type="text"
              // error={accountCreationEmailExistError || invalidEmailError}
              // helperText={
              //   (!!accountCreationEmailExistError &&
              //     "An account with the given email already exists.") ||
              //   (!!invalidEmailError && "Please enter a valid email.")
              // }
              onChange={onChange}
            />
            <Autocomplete
              fullWidth
              size="small"
              disablePortal
              id={"province"}
              value={province}
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
              value={postalCode}
              InputLabelProps={{ shrink: true }}
              name={"postal_code"}
              // error={invalidPostalCodeError}
              // helperText={
              //   (!!invalidPostalCodeError && "Please enter a valid postal code.")
              // }
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
