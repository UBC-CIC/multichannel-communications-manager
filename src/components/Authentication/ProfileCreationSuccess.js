import { Typography, Grid, Button } from "@mui/material";
import React from "react";
import { I18n } from "aws-amplify";

const ProfileCreationSuccess = ({ login }) => {
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
      <Typography variant="h2">{I18n.get("thankyou")}</Typography>
      <Typography
        variant="h6"
        sx={{ mt: "2em", ml: "0.5em", fontColor: "#484848", fontWeight: "400" }}
      >
        {I18n.get("profileCreated")}
      </Typography>
      <Button
        variant="contained"
        sx={{ width: "20%", alignSelf: "flex-end", mt: "5em" }}
        onClick={login}
      >
        {I18n.get("continue")}
      </Button>
    </Grid>
  );
};

export default ProfileCreationSuccess;
