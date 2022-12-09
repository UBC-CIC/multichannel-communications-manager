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
    
  const EmailChangeDialog = ({
    open,
    handleClose,
    handleSave,
    state,
    email,
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
        {state === "verifyEmail" && (
          <>
          <DialogTitle>Email Verification</DialogTitle>
          <DialogContent sx={{ mt: "1em" }}>
            <Typography variant="body2" sx={{ fontColor: "#484848" }}>
              A verification code has been sent to {email}
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
        {state === "emailUpdated" && (
          <>
          <DialogTitle>Success!</DialogTitle>
          <DialogContent sx={{ mt: "1em" }}>
            <Typography variant="body2" sx={{ fontColor: "#484848" }}>
              Your email has been successfully updated.
            </Typography>
            <Box sx={{display: "flex", justifyContent: "center", mt: "3em"}} >
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
  
  export default EmailChangeDialog;
  