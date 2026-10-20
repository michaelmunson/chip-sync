import { createTheme, PaletteMode } from "@mui/material";

/**
 * Concrete values mirroring src/css/tokens.css. MUI needs real colors for its
 * palette math (alpha/darken); component overrides below use the CSS variables
 * so light/dark follow <html data-theme>.
 */
const brand = {
  green: "#216849",
  greenDark: "#1a5339",
  greenSoft: "#eef7f1",
  mint: "#6cc496",
  ink: "#16201a",
  muted: "#637268",
  line: "#e4e8e2",
  surface: "#ffffff",
  bg: "#f4f6f3",
  night: "#0d1410",
  nightSurface: "#151d18",
  nightInk: "#e9f0eb",
  nightMuted: "#94a69b",
  nightLine: "#26332b",
};

const FONT =
  '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

function workspaceTheme(mode: PaletteMode) {
  const light = mode === "light";
  return createTheme({
    palette: {
      mode,
      primary: {
        main: light ? brand.green : brand.mint,
        dark: light ? brand.greenDark : "#8dd4ae",
        light: brand.greenSoft,
        contrastText: light ? "#ffffff" : "#0c1a13",
      },
      secondary: { main: light ? "#5a7a6c" : "#8fad9c" },
      success: {
        main: light ? brand.green : brand.mint,
        contrastText: light ? "#ffffff" : "#0c1a13",
      },
      error: { main: light ? "#b94a48" : "#ec8d8a" },
      warning: { main: light ? "#b7791f" : "#e0b06a" },
      info: { main: light ? "#3d7a8c" : "#7eb6c4" },
      background: {
        default: light ? brand.bg : brand.night,
        paper: light ? brand.surface : brand.nightSurface,
      },
      text: {
        primary: light ? brand.ink : brand.nightInk,
        secondary: light ? brand.muted : brand.nightMuted,
      },
      divider: light ? brand.line : brand.nightLine,
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: FONT,
      fontSize: 14.5,
      button: { textTransform: "none", fontWeight: 650, letterSpacing: "-0.005em" },
      h1: { fontWeight: 750, letterSpacing: "-0.03em" },
      h2: { fontWeight: 700, letterSpacing: "-0.025em" },
      h3: { fontWeight: 700, letterSpacing: "-0.02em" },
      h4: { fontWeight: 700, letterSpacing: "-0.02em" },
      h5: { fontWeight: 700, letterSpacing: "-0.015em" },
      h6: { fontWeight: 700, letterSpacing: "-0.01em" },
      body1: { letterSpacing: "-0.005em" },
      body2: { letterSpacing: "-0.005em" },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: { fontFamily: FONT, backgroundColor: "var(--bg)", color: "var(--ink)" },
        },
      },

      /* Buttons */
      MuiButton: {
        defaultProps: { disableElevation: true, disableRipple: false },
        styleOverrides: {
          root: {
            minHeight: 42,
            borderRadius: 12,
            paddingInline: 18,
            fontSize: "0.9375rem",
            transition:
              "background-color 140ms ease, border-color 140ms ease, box-shadow 140ms ease, color 140ms ease, transform 100ms ease",
            "&:active:not(.Mui-disabled)": { transform: "translateY(0.5px)" },
            "&.Mui-focusVisible": { boxShadow: "var(--ring)" },
          },
          sizeSmall: { minHeight: 34, paddingInline: 13, fontSize: "0.875rem", borderRadius: 10 },
          sizeLarge: { minHeight: 50, paddingInline: 24, fontSize: "1rem", borderRadius: 14 },
          containedPrimary: {
            backgroundColor: "var(--brand)",
            color: "var(--on-brand)",
            boxShadow: "var(--sh-xs), inset 0 1px 0 rgb(255 255 255 / 0.12)",
            "&:hover": { backgroundColor: "var(--brand-hover)" },
            "&.Mui-disabled": {
              backgroundColor: "var(--surface-3)",
              color: "var(--faint)",
              boxShadow: "none",
            },
          },
          containedError: {
            backgroundColor: "var(--danger)",
            "&:hover": { backgroundColor: "var(--danger)", filter: "brightness(0.93)" },
          },
          outlined: {
            borderColor: "var(--line-strong)",
            borderWidth: 1,
            "&:hover": { borderWidth: 1 },
          },
          outlinedPrimary: {
            color: "var(--ink)",
            backgroundColor: "var(--surface)",
            "&:hover": { backgroundColor: "var(--surface-2)", borderColor: "var(--faint)" },
          },
          outlinedError: {
            "&:hover": { backgroundColor: "var(--danger-soft)", borderColor: "var(--danger)" },
          },
          textPrimary: {
            color: "var(--brand)",
            "&:hover": { backgroundColor: "var(--brand-soft)" },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            color: "var(--muted)",
            transition: "background-color 140ms ease, color 140ms ease",
            "&:hover": { backgroundColor: "var(--surface-3)", color: "var(--ink)" },
            "&.Mui-focusVisible": { boxShadow: "var(--ring)" },
          },
        },
      },

      /* Inputs */
      MuiTextField: { defaultProps: { variant: "outlined", fullWidth: true } },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            fontSize: "0.9375rem",
            "&.Mui-focused": { color: "var(--brand)" },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backgroundColor: "var(--surface)",
            transition: "box-shadow 140ms ease, background-color 140ms ease",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "var(--line-strong)",
              transition: "border-color 140ms ease",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "var(--faint)" },
            "&.Mui-focused": { boxShadow: "var(--ring)" },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "var(--brand)",
              borderWidth: 1.5,
            },
            "&.Mui-error .MuiOutlinedInput-notchedOutline": { borderColor: "var(--danger)" },
          },
          input: { paddingBlock: 13 },
          inputSizeSmall: { paddingBlock: 10 },
        },
      },
      MuiFormHelperText: {
        styleOverrides: { root: { marginInline: 2, fontSize: "0.8125rem" } },
      },
      MuiCheckbox: { defaultProps: { color: "primary" } },
      MuiAutocomplete: {
        styleOverrides: {
          paper: {
            borderRadius: 14,
            border: "1px solid var(--line)",
            boxShadow: "var(--sh-md)",
            marginTop: 6,
          },
          listbox: { padding: 6 },
          option: { borderRadius: 8, fontSize: "0.9375rem" },
        },
      },

      /* Segmented control */
      MuiToggleButtonGroup: {
        styleOverrides: {
          root: {
            padding: 3,
            gap: 2,
            borderRadius: 12,
            backgroundColor: "var(--surface-3)",
            width: "100%",
            "& .MuiToggleButtonGroup-grouped": {
              border: 0,
              borderRadius: "9px !important",
              flex: 1,
              margin: 0,
            },
          },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.9375rem",
            minHeight: 38,
            gap: 8,
            color: "var(--muted)",
            transition: "background-color 140ms ease, color 140ms ease, box-shadow 140ms ease",
            "&:hover": { backgroundColor: "transparent", color: "var(--ink)" },
            "&.Mui-selected": {
              backgroundColor: "var(--surface)",
              color: "var(--ink)",
              boxShadow: "var(--sh-sm)",
              "&:hover": { backgroundColor: "var(--surface)" },
            },
            "&.Mui-focusVisible": { boxShadow: "var(--ring)" },
          },
        },
      },
      MuiTabs: {
        styleOverrides: { root: { minHeight: 44 }, indicator: { height: 2, borderRadius: 2 } },
      },
      MuiTab: {
        styleOverrides: { root: { textTransform: "none", fontWeight: 600, minHeight: 44 } },
      },

      /* Surfaces */
      MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
      MuiDialog: {
        styleOverrides: { paper: { borderRadius: 24, backgroundImage: "none" } },
      },
      MuiAccordion: {
        defaultProps: { disableGutters: true },
        styleOverrides: {
          root: {
            boxShadow: "none",
            "&:before": { display: "none" },
            "&.Mui-expanded": { margin: 0 },
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: { borderRadius: 12, alignItems: "center", fontSize: "0.9rem" },
        },
      },
      MuiChip: { styleOverrides: { root: { borderRadius: 10, fontWeight: 600 } } },
      MuiBadge: {
        styleOverrides: {
          badge: { fontWeight: 700, fontSize: "0.6875rem", border: "2px solid var(--surface)" },
        },
      },
      MuiTooltip: {
        defaultProps: { arrow: true },
        styleOverrides: {
          tooltip: {
            backgroundColor: "#16201a",
            color: "#fff",
            fontSize: "0.8125rem",
            fontWeight: 600,
            borderRadius: 8,
            padding: "6px 10px",
          },
          arrow: { color: "#16201a" },
        },
      },
      MuiDivider: { styleOverrides: { root: { borderColor: "var(--line)" } } },
    },
  });
}

const Theme = {
  dark: workspaceTheme("dark"),
  light: workspaceTheme("light"),
  brand,
  decide(): "light" | "dark" {
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  },
};

export default Theme;
