import React from "react";
import { Box, Typography } from "@mui/material";
import NotificationLogTable from "../components/landingPage/NotificationLogTable";

const Landing = () => {
  return (
    <Box>
      <Typography variant="h2" sx={{ mb: "1em" }}>
        Welcome!
      </Typography>
      <NotificationLogTable />
    </Box>
  );
};

export default Landing;
