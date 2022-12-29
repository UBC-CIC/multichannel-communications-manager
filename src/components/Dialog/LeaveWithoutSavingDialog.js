import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { I18n } from "aws-amplify";

export const LeaveWithoutSavingDialog = ({
  showDialog,
  setShowDialog,
  cancelNavigation,
  confirmNavigation,
}) => {
  const handleDialogClose = () => {
    setShowDialog(false);
  };

  return (
    <Dialog
      open={showDialog}
      PaperProps={{ sx: { minWidth: "45%", padding: "2em" } }}
      onClose={handleDialogClose}
    >
      <DialogTitle>{I18n.get("confirmLeavePage")}</DialogTitle>
      <DialogContent sx={{ mt: "1em" }}>
        <Typography>{I18n.get("changesNotSaved")}</Typography>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={cancelNavigation}>
          {I18n.get("no")}
        </Button>
        <Button variant="contained" onClick={confirmNavigation}>
          {I18n.get("yes")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
