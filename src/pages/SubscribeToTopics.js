import React from "react";
import { Box, Typography } from "@mui/material";
import ViewTopics from "../components/subscribeToTopics/ViewTopics";
import { I18n } from "aws-amplify";

const SubscribeToTopics = ({ language }) => {
  return (
    <Box>
      <Typography variant="h3" sx={{ mb: "1em" }}>
        {I18n.get("selectCategories")}
      </Typography>
      <ViewTopics language={language} />
    </Box>
  );
};

export default SubscribeToTopics;
