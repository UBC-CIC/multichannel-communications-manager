import {
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  Box,
  Button,
} from "@mui/material";
    
const UnsubscribeDialog = ({
  open,
  handleClose,
  title,
  notificationType,
  handleSave
}) => {
  return (
    <Dialog
      aria-labelledby="notification-preferences-dialog"
      PaperProps={{ sx: { minWidth: "45%", padding: "2em" } }}
      open={open}
      onClose={handleClose}
    >
      {notificationType === "Email" ? (
        <DialogTitle>Unsubscribe from Email Notifications?</DialogTitle>
      ) : notificationType === "Text" ? (
        <DialogTitle>Unsubscribe from Text Notifications?</DialogTitle>
      ) : (
        <DialogTitle>Unsubscribe from {title}?</DialogTitle>
      )}
      <DialogContent sx={{ mt: "1em" }}>
        {notificationType === "Email" ? (
          <Typography variant="body2" sx={{ fontColor: "#484848" }}>
            You will no longer receive newsletter and update emails regarding {title}.
          </Typography>
        ) : notificationType === "Text" ? (
          <Typography variant="body2" sx={{ fontColor: "#484848" }}>
            You will no longer receive newsletter and update texts regarding {title}.
          </Typography>
        ) : (
          <Typography variant="body2" sx={{ fontColor: "#484848" }}>
            You will no longer receive updates regarding {title}.
          </Typography>
        )}
        <Box
          sx={{ display: "flex", justifyContent: "space-evenly", mt: "2em" }}
        >
          <Button
            variant="outlined"
            sx={{ width: "40%" }}
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            sx={{ width: "40%" }}
            onClick={handleSave}
          >
            Unsubscribe
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default UnsubscribeDialog;
