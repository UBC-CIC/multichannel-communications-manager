import {
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  Box,
  TextField,
  Button,
  } from "@mui/material";
import { Dialpad } from "@mui/icons-material";
import TextFieldStartAdornment from "./Authentication/TextFieldStartAdornment"
  
const PhoneNumberDialog = ({
  open,
  handleClose,
  handleSave,
  state,
  phone,
  setPhone,
  code,
  setCode,
  inputError,
  setInputError
}) => {
  return (
    <Dialog
    aria-labelledby="notification-preferences-dialog"
    PaperProps={{ sx: { minWidth: "45%", padding: "2em" } }}
    open={open}
    onClose={handleClose}
    >
      {state === "noPhone" && (
        <>
        <DialogTitle>No Phone Number Found</DialogTitle>
        <DialogContent sx={{ mt: "1em" }}>
          <Typography variant="body2" sx={{ fontColor: "#484848" }}>
            You have not currently provided a phone number for notifications.
            Enter your phone number below to continue.
          </Typography>
          <Box sx={{display: "flex", flexDirection: "column", justifyContent: "space-between", mt: "3em"}} >
            <Box sx={{display: "flex", alignItems: "center", justifyContent: "space-between", pb: "1.5em"}} >
              <TextField
                fullWidth
                size="small"
                label={"Phone Number"}
                InputLabelProps={{ shrink: true }}
                name={"phone"}
                value={phone}
                type="text"
                error={inputError}
                helperText={
                  (!!inputError &&
                    "Please enter a valid phone number.")
                }
                onChange={(e) => {setInputError(false); setPhone(e.target.value)}}
              />
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-evenly", mt: "2em" }} >
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
        </>
      )}
      {state === "verifyPhone" && (
        <>
        <DialogTitle>Phone Number Verification</DialogTitle>
        <DialogContent sx={{ mt: "1em" }}>
          <Typography variant="body2" sx={{ fontColor: "#484848" }}>
            A verification code has been sent to {phone}
          </Typography>
          <Box sx={{display: "flex", flexDirection: "column", justifyContent: "space-between", mt: "3em"}} >
            <Box sx={{display: "flex", alignItems: "center", justifyContent: "space-between", pb: "1.5em"}} >
            <TextFieldStartAdornment
              startIcon={<Dialpad />}
              placeholder="Enter your verification code."
              name={"authCode"}
              value={code}
              error={inputError}
              helperText={
                (!!inputError &&
                  "Invalid verification code provided, please try again.")
              }
              onChange={(e) => {setInputError(false); setCode(e.target.value)}}
              type="text"
            />
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-evenly", mt: "2em" }} >
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
                Verify
              </Button>
            </Box>
          </Box>
        </DialogContent>
        </>
      )}
      {state === "phoneSaved" && (
        <>
        <DialogTitle>Success!</DialogTitle>
        <DialogContent sx={{ mt: "1em" }}>
          <Typography variant="body2" sx={{ fontColor: "#484848" }}>
            Your phone number has been successfully saved.
          </Typography>
          <Box sx={{display: "flex", flexDirection: "column", justifyContent: "space-between", mt: "3em"}} >
              <Button
                variant="contained"
                sx={{ width: "30%" }}
                onClick={handleSave}
              >
                Done
              </Button>
          </Box>
        </DialogContent>
        </>
      )}
  </Dialog>
  );
};

export default PhoneNumberDialog;
