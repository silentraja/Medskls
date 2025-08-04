// theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#F1BD2B",   // main gold
      dark: "#D9A500",   // darker gold
      light: "#F1BD2B",  // lighter gold
      contrastText: "#000", // text on gold buttons
      MainTextColor : "#000000",
    },
    background: {
      default: "#fefefe",
      lightBeige: "#FFF9E9"
    },
  },
  typography: {
    TitleFont: {
      fontFamily: "'Masqualero', sans-serif",
    },
  },
});

export default theme;
