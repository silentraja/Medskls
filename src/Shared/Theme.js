// theme.js or wherever you create your MUI theme
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#F1BD2B",   // main gold
      dark: "#D9A500",   // darker gold
      light: "#FFD95A",  // lighter gold
      contrastText: "#000", // text on gold buttons
    },
    background: {
      default: "#fefefe",
    },
  },
  typography: {
    // You can adjust fonts too if needed
  },
});

export default theme;
