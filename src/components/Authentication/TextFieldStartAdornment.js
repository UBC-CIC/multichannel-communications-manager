import React from "react";
import { Grid, InputAdornment, TextField } from "@mui/material";

export default function TextFieldStartAdornment(props) {
  const { startIcon, placeholder, ...other } = props;
  return (
    <Grid
      container
      item
      direction={"column"}
      sx={{ "& .MuiOutlinedInput-root & fieldset": { borderRadius: 0 } }}
    >
      <TextField
        {...other}
        placeholder={placeholder}
        fullWidth={true}
        variant="outlined"
        FormHelperTextProps={{ fontSize: "1rem" }}
        InputProps={{
          startAdornment: startIcon && (
            <InputAdornment position="start" disablePointerEvents>
              {startIcon}
            </InputAdornment>
          ),
        }}
        size={startIcon ? "medium" : "small"}
      />
    </Grid>
  );
}
