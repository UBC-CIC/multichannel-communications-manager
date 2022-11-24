import React from "react";
import { Box, Typography, TextField, Autocomplete, Button } from "@mui/material";

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

  return (
    <Box>
      <Typography variant="h2" sx={{ mb: "1em" }}>
        Edit Account Information
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "1em",
          mb: "2em",
        }}
      >
        <TextField
          startIcon={false}
          label={"Email"}
          name={"email"}
          type="email"
          // error={accountCreationEmailExistError || invalidEmailError}
          // helperText={
          //   (!!accountCreationEmailExistError &&
          //     "An account with the given email already exists.") ||
          //   (!!invalidEmailError && "Please enter a valid email.")
          // }
          // onChange={onChange}
        />
         <TextField
          startIcon={false}
          label={"Phone Number"}
          name={"phone"}
          type="text"
          // error={accountCreationEmailExistError || invalidEmailError}
          // helperText={
          //   (!!accountCreationEmailExistError &&
          //     "An account with the given email already exists.") ||
          //   (!!invalidEmailError && "Please enter a valid email.")
          // }
          // onChange={onChange}
        />
        <Autocomplete
          disablePortal
          id={"province"}
          options={provinceOptions}
          renderInput={(params) => (
            <TextField {...params} label="Province" />
          )}
          ListboxProps={{ style: { maxHeight: "7rem" } }}
          // onChange={onChange}
        />
        <TextField
          startIcon={false}
          label={"Postal Code"}
          name={"postal_code"}
          // error={invalidPostalCodeError}
          // helperText={
          //   (!!invalidPostalCodeError && "Please enter a valid postal code.")
          // }
          type="text"
          // onChange={onChange}
        />
        <Button>
          Save
        </Button>
      </Box>
    </Box>
  );
};

export default EditAccountInfo;
