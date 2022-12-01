import {
    Dialog,
    DialogContent,
    DialogTitle,
    Typography,
    Box,
    Button,
    } from "@mui/material";
    
  const NotificationSuccessDialog = ({
    open,
    handleClose,
  }) => {
    return (
      <Dialog
      aria-labelledby="notification-preferences-dialog"
      PaperProps={{ sx: { minWidth: "45%", padding: "2em" } }}
      open={open}
      onClose={handleClose}
      >
    
          <DialogTitle>Success!</DialogTitle>
          <DialogContent sx={{ mt: "1em" }}>
            <Typography variant="body2" sx={{ fontColor: "#484848" }}>
              Your notification preferences have been successfully saved.
            </Typography>
            <Box sx={{display: "flex", justifyContent: "center", mt: "3em"}} >
                <Button
                  variant="contained"
                  onClick={handleClose}
                >
                  Close
                </Button>
            </Box>
          </DialogContent>
    </Dialog>
    );
  };
  
  export default NotificationSuccessDialog;
  