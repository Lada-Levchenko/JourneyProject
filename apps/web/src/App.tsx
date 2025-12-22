import { AuthPage } from "./pages/auth/AuthPage";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { muiTheme } from "@/shared/theme/muiTheme";

export default function App() {
  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <AuthPage />
    </ThemeProvider>
  );
}
