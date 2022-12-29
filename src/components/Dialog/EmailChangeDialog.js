import {
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  Box,
  Button,
} from "@mui/material";
import { Dialpad } from "@mui/icons-material";
import TextFieldStartAdornment from "../Authentication/TextFieldStartAdornment";
import { I18n } from "aws-amplify";

const EmailChangeDialog = ({
  open,
  handleClose,
  handleSave,
  state,
  email,
  code,
  setCode,
  inputError,
  setInputError,
}) => {
  return (
    <Dialog
      aria-labelledby="notification-preferences-dialog"
      PaperProps={{ sx: { minWidth: "45%", padding: "2em" } }}
      open={open}
      onClose={handleClose}
    >
      {state === "verifyEmail" && (
        <>
          <DialogTitle>Email Verification</DialogTitle>
          <DialogContent sx={{ mt: "1em" }}>
            <Typography variant="body2" sx={{ fontColor: "#484848" }}>
              {I18n.get("verificationSent") + email}
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                mt: "3em",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  pb: "1.5em",
                }}
              >
                <TextFieldStartAdornment
                  startIcon={<Dialpad />}
                  placeholder={I18n.get("verifyCodePrompt")}
                  name={"authCode"}
                  value={code}
                  error={inputError}
                  helperText={
                    !!inputError && I18n.get("invalidVerificationCode")
                  }
                  onChange={(e) => {
                    setInputError(false);
                    setCode(e.target.value);
                  }}
                  type="text"
                />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-evenly",
                  mt: "2em",
                }}
              >
                <Button
                  variant="outlined"
                  sx={{ width: "30%" }}
                  onClick={handleClose}
                >
                  {I18n.get("cancel")}
                </Button>
                <Button
                  variant="contained"
                  sx={{ width: "30%" }}
                  onClick={handleSave}
                >
                  {I18n.get("verify")}
                </Button>
              </Box>
            </Box>
          </DialogContent>
        </>
      )}
      {state === "emailUpdated" && (
        <>
          <DialogTitle>{I18n.get("success")}</DialogTitle>
          <DialogContent sx={{ mt: "1em" }}>
            <Typography variant="body2" sx={{ fontColor: "#484848" }}>
              {I18n.get("emailUpdateSuccess")}
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center", mt: "3em" }}>
              <Button
                variant="contained"
                sx={{ width: "30%" }}
                onClick={handleSave}
              >
                {I18n.get("done")}
              </Button>
            </Box>
          </DialogContent>
        </>
      )}
    </Dialog>
  );
};

export default EmailChangeDialog;
