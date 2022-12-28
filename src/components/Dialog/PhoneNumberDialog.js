import {
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  Box,
  Button,
} from "@mui/material";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/high-res.css";
import { Dialpad } from "@mui/icons-material";
import TextFieldStartAdornment from "../Authentication/TextFieldStartAdornment";
import { I18n } from "aws-amplify";

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
  setInputError,
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
          <DialogTitle>{I18n.get("phoneNoFound")}</DialogTitle>
          <DialogContent sx={{ mt: "1em" }}>
            <Typography variant="body2" sx={{ fontColor: "#484848" }}>
              {I18n.get("missingPhoneNo")}
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
                <PhoneInput
                  inputStyle={{ width: "100%" }}
                  country={"ca"}
                  onlyCountries={["ca"]}
                  disableDropdown
                  countryCodeEditable={false}
                  value={phone}
                  onChange={(value) => setPhone(value)}
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
                  {I18n.get("save")}
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
      {state === "phoneSaved" && (
        <>
          <DialogTitle>{I18n.get("success")}</DialogTitle>
          <DialogContent sx={{ mt: "1em" }}>
            <Typography variant="body2" sx={{ fontColor: "#484848" }}>
              {I18n.get("phoneNoSaved")}
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

export default PhoneNumberDialog;
