import { createTheme } from "@mui/material/styles";
import blue from "@mui/material/colors/blue";

const theme = createTheme({
  palette: {
    primary: {
      main: "#012144",
    },
    secondary: {
      main: blue[500],
    },
    darkTheme: {
      main: "#282c34",
      card: "#4a4f59",
    },
  },
  components: {
    MuiTypography: {
      variants: [
        {
          props: {
            variant: "h1",
          },
          style: {
            fontSize: 40,
            color: "pink",
            fontWeight: 300,
          },
        },
      ],
    },
  },
});

export default theme;
