import React from "react";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { Grid } from "@mui/material";
import { I18n } from "aws-amplify";

const SignUpStepper = ({ activeStep }) => {
  const steps = [
    I18n.get("generalInfo"),
    I18n.get("verification"),
    I18n.get("selectCategories"),
  ];

  const theme = useTheme();
  const mobileView = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Grid
      xs
      item
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        my: "2em",
      }}
    >
      <Typography
        variant="h2"
        sx={{
          textAlign: "center",
          fontSize: "2rem",
          color: "whitesmoke",
          mb: "2em",
        }}
      >
        {I18n.get("setUpProfile")}
      </Typography>
      <Stepper
        activeStep={activeStep}
        orientation={mobileView ? "horizontal" : "vertical"}
      >
        {steps.map((step, index) => (
          <Step
            key={index}
            sx={{
              "& .MuiStepLabel-root .Mui-completed": {
                color: "#738DED", // completed step circle colour
              },
              "& .MuiStepLabel-root .Mui-active": {
                color: "#738DED", // active step circle colour
              },
              "& .MuiStepLabel-root .Mui-active .MuiStepIcon-text": {
                fill: "black", // active step circle number colour
              },
            }}
          >
            <StepLabel>
              <Typography
                sx={{
                  position: "relative",
                  color: "whitesmoke",
                  width: "12em",
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  fontFamily: "Roboto",
                }}
              >
                {step}
              </Typography>
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Grid>
  );
};

export default SignUpStepper;
