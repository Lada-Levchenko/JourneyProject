import { createTheme } from "@mui/material/styles";
import { colors } from "@/shared/tokens/design";

declare module "@mui/material/Paper" {
  interface PaperPropsVariantOverrides {
    "glass-pane": true;
  }
}

export const muiTheme = createTheme({
  spacing: 8,
  shape: {
    borderRadius: 8,
  },
  palette: {
    primary: {
      main: colors.primary.main,
      contrastText: colors.primary.contrastText,
    },
    secondary: {
      main: colors.secondary.main,
      contrastText: colors.secondary.contrastText,
    },
  },
  components: {
    MuiPaper: {
      variants: [
        {
          props: { variant: "glass-pane" },
          style: {
            padding: 16,
            width: 552,
            minHeight: 529,
            backgroundColor: colors.background.whiteTransparent,
            backdropFilter: "blur(13.3px)",
            borderRadius: 8,
          },
        },
      ],
      styleOverrides: {
        root: {
          // global Paper defaults if needed later
        },
      },
    },
  },
});
