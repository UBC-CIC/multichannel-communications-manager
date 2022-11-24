import { Typography, Grid, Button } from "@mui/material";
import React from "react";

const ProfileCreationSuccess = ( {login} ) => {
  return (
    <Grid
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        height: "100%",
        pb: "3em",
      }}
    >
      <Typography variant="h2">Thank You!</Typography>
      <Typography
        variant="h6"
        sx={{ mt: "2em", ml: "0.5em", fontColor: "#484848", fontWeight: "400" }}
      >
        Your user profile has been created
      </Typography>
      <Button
        variant="contained"
        sx={{ width: "20%", alignSelf: "flex-end", mt: "5em" }}
        onClick={login}
      >
        Continue
      </Button>
    </Grid>
  );
};

export default ProfileCreationSuccess;
