import { createTheme, PaletteMode } from "@mui/material";

function workspaceTheme(mode: PaletteMode) {
  return createTheme({
    palette: {
      mode,
      primary: { main: mode === "light" ? "#216849" : "#86cfa7" },
      secondary: { main: "#66877a" },
      background: {
        default: mode === "light" ? "#f5f7f5" : "#111d18",
        paper: mode === "light" ? "#ffffff" : "#1b2b23",
      },
      text: {
        primary: mode === "light" ? "#20372b" : "#edf5ef",
        secondary: mode === "light" ? "#65766c" : "#b0c2b7",
      },
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily:
        'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      button: { textTransform: "none", fontWeight: 600 },
      h1: { fontWeight: 700 },
      h2: { fontWeight: 600 },
    },
    components: {
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: { root: { minHeight: 44, borderRadius: 10 } },
      },
      MuiTextField: { defaultProps: { variant: "outlined", fullWidth: true } },
      MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 10 } } },
      MuiTab: {
        styleOverrides: { root: { textTransform: "none", fontWeight: 600 } },
      },
      MuiAccordion: {
        defaultProps: { disableGutters: true },
        styleOverrides: { root: { boxShadow: "none" } },
      },
    },
  });
}
const Theme = {
  dark: workspaceTheme("dark"),
  light: workspaceTheme("light"),
  decide(): "light" | "dark" {
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  },
};
export default Theme;
