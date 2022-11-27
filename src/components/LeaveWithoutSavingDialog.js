import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";

export const LeaveWithoutSavingDialog = ({
  showDialog,
  setShowDialog,
  cancelNavigation,
  confirmNavigation
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
      <DialogTitle>Leaving Page?</DialogTitle>
      <DialogContent sx={{ mt: "1em" }}>
        <Typography>Your changes have not been saved. Do you want to leave without saving?</Typography>
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={cancelNavigation}>
          No
        </Button>
        <Button variant="contained" onClick={confirmNavigation}>
          Yes
        </Button>
      </DialogActions>
    </Dialog>
  );
};
