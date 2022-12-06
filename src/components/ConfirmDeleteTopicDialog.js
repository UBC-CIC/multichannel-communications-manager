import {
    Dialog,
    DialogContent,
    DialogTitle,
    Typography,
    Box,
    Button,
  } from "@mui/material";
      
  const ConfirmDeleteTopicDialog = ({
    open,
    handleClose,
    handleDelete,
    type
  }) => {
    return (
      <Dialog
        aria-labelledby="notification-preferences-dialog"
        PaperProps={{ sx: { minWidth: "35%", padding: "2em" } }}
        open={open}
        onClose={handleClose}
      >
        <DialogTitle>Are you sure you wish to proceed?</DialogTitle>
        <DialogContent sx={{ mt: "1em" }}> 
          {type === 'category' ? 
            <Typography variant="body2" sx={{ fontColor: "#484848" }}>
              Doing so will remove the selected categories for all users.
            </Typography> : 
            <Typography variant="body2" sx={{ fontColor: "#484848" }}>
              Doing so will remove the selected topics for all categories.
            </Typography>}
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
              onClick={handleDelete}
            >
              Delete
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    );
  };
  
  export default ConfirmDeleteTopicDialog;
  