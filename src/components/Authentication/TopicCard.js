import {
  Card,
  CardHeader,
  CardMedia,
  Typography,
  IconButton,
  CardContent,
  CardActions,
  Box,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import React, { useState } from "react";
import NotificationPreferencesDialog from "../NotificationPreferencesDialog";
import "../TopicCard.css";

const TopicCard = ({
  selectedTopic,
  selectedSubTopics,
  setSelectedSubtopics,
}) => {
  const { title, description, image } = selectedTopic;
  const initialNotificationSelection = { text: false, email: false };
  const [openNotificationDialog, setOpenNotificationDialog] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState(
    initialNotificationSelection
  );
  const [isRotated, setIsRotated] = useState(false);
  const subtopics = ["COVID-19", "Subtopic 2", "Subtopic 3", "Subtopic 4"];

  const handleCloseNotificationDialog = () => {
    setOpenNotificationDialog(false);
  };

  const handleChange = (e, subtopic) => {
    if (e.target.checked) {
      setSelectedSubtopics((prev) => [...prev, `${title}/${subtopic}`]);
    } else if (!e.target.checked) {
      setSelectedSubtopics((prev) =>
        prev.filter((s) => s !== `${title}/${subtopic}`)
      );
    }
  };

  const renderCardFront = () => {
    return (
      <>
        <Card>
          <CardHeader
            title={title}
            titleTypographyProps={{
              fontSize: "1.2rem",
              fontWeight: "400",
            }}
          />
          {image ? (
            <CardMedia component={"img"} height="120" />
          ) : (
            <Box
              sx={{
                backgroundColor: "#738DED",
                height: "120px",
                width: "100%",
              }}
            />
          )}
          <CardContent sx={{ p: "16px 16px 0px 16px" }}>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: "1.5em" }}
            >
              Notifications selected:{" "}
              {Object.values(selectedNotifications).some((val) => val === true)
                ? Object.keys(selectedNotifications)
                    .filter(function (key) {
                      return selectedNotifications[key];
                    })
                    .map(String)
                : "None"}
            </Typography>
          </CardContent>
          <CardActions
            disableSpacing
            sx={{ justifyContent: "flex-end", pt: "0px" }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Button
                sx={{ mr: "1em" }}
                onClick={() => setIsRotated(!isRotated)}
              >
                View Subtopics
              </Button>
              <IconButton
                aria-label="subscribe to topic"
                onClick={() => setOpenNotificationDialog(true)}
              >
                <NotificationsIcon />
              </IconButton>
            </Box>
          </CardActions>
        </Card>
        <NotificationPreferencesDialog
          open={openNotificationDialog}
          handleClose={handleCloseNotificationDialog}
          selectedTopic={selectedTopic}
          selectedNotifications={selectedNotifications}
          setSelectedNotifications={setSelectedNotifications}
        />
      </>
    );
  };

  const renderCardBack = () => {
    return (
      <Card>
        <CardHeader
          title={title}
          titleTypographyProps={{
            fontSize: "1.2rem",
            fontWeight: "400",
          }}
        />
        <CardContent sx={{ p: "16px 16px 0px 16px" }}>
          <FormGroup>
            {subtopics.map((subtopic, index) => (
              <FormControlLabel
                key={index}
                control={<Checkbox />}
                checked={selectedSubTopics.includes(`${title}/${subtopic}`)}
                label={subtopic}
                onChange={(e) => handleChange(e, subtopic)}
              />
            ))}
          </FormGroup>
        </CardContent>
        <CardActions
          disableSpacing
          sx={{ justifyContent: "flex-end", pt: "0px" }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Button sx={{ mr: "1em" }} onClick={() => setIsRotated(!isRotated)}>
              Save
            </Button>
          </Box>
        </CardActions>
      </Card>
    );
  };

  return (
    <div className={`card ${isRotated ? "rotated" : ""}`}>
      {!isRotated ? (
        <div className="front">{renderCardFront()}</div>
      ) : (
        <div className="back">{renderCardBack()}</div>
      )}
    </div>
  );
};

export default TopicCard;
