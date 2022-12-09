import React from "react";
import { Box, Typography } from "@mui/material";
import ViewTopics from "../components/subscribeToTopics/ViewTopics";

const SubscribeToTopics = () => {
  return (
    <Box>
      <Typography variant="h3" sx={{ mb: "1em" }}>
        Categories of Interest
      </Typography>
      <ViewTopics />
    </Box>
  );
};

export default SubscribeToTopics;
