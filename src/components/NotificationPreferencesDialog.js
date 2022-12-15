import {
  Alert,
  Grid,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  Box,
  Switch,
  FormGroup,
  Button,
} from "@mui/material";
import theme from "../themes";
import React from "react";

const NotificationPreferencesDialog = ({
  open,
  handleClose,
  handleSave,
  selectedTopic,
  selectedNotifications,
  setSelectedNotifications,
}) => {
  const { title } = selectedTopic;
  return (
    <Dialog
      aria-labelledby="notification-preferences-dialog"
      PaperProps={{ sx: { minWidth: "45%", padding: "2em" } }}
      open={open}
      onClose={handleClose}
    >
      <DialogTitle>Notification Preferences</DialogTitle>
      <DialogContent sx={{ mt: "1em" }}>
        <Typography variant="body2" sx={{ fontColor: "#484848" }}>
          Receive newsletters and updates regarding {title}
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            mt: "3em",
          }}
        >
          <FormGroup>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "2px #D3D3D3 solid",
                pb: "1.5em",
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: "400" }}>
                Email Notifications
              </Typography>
              <Switch
                id="email"
                checked={selectedNotifications.email}
                onChange={() =>
                  setSelectedNotifications((prev) => ({
                    ...prev,
                    email: !selectedNotifications.email,
                  }))
                }
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                pt: "1.5em",
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: "400" }}>
                Text Notifications
              </Typography>
              <Switch
                id="text"
                checked={selectedNotifications.text}
                onChange={() =>
                  setSelectedNotifications((prev) => ({
                    ...prev,
                    text: !selectedNotifications.text,
                  }))
                }
              />
            </Box>
          </FormGroup>
          <Box
            sx={{ display: "flex", justifyContent: "space-evenly", mt: "2em" }}
          >
            <Button
              variant="outlined"
              sx={{ width: "30%" }}
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              sx={{ width: "30%" }}
              onClick={handleSave}
            >
              Save
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationPreferencesDialog;
