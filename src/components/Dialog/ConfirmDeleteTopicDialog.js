import {
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  Box,
  Button,
} from "@mui/material";
import I18n from "aws-amplify";

const ConfirmDeleteTopicDialog = ({
  open,
  handleClose,
  handleDelete,
  type,
}) => {
  return (
    <Dialog
      aria-labelledby="notification-preferences-dialog"
      PaperProps={{ sx: { minWidth: "35%", padding: "2em" } }}
      open={open}
      onClose={handleClose}
    >
      <DialogTitle>{I18n.get("confirmProceed")}</DialogTitle>
      <DialogContent sx={{ mt: "1em" }}>
        {type === "category" ? (
          <Typography variant="body2" sx={{ fontColor: "#484848" }}>
            {I18n.get("deleconfirmDeleteCategory")}
          </Typography>
        ) : (
          <Typography variant="body2" sx={{ fontColor: "#484848" }}>
            {I18n.get("deleconfirmDeleteTopic")}
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
            {I18n.get("cancel")}
          </Button>
          <Button
            variant="contained"
            sx={{ width: "40%" }}
            onClick={handleDelete}
          >
            {I18n.get("delete")}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDeleteTopicDialog;
