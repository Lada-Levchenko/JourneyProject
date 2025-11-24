import { TamaguiProvider } from "@tamagui/core";
import config from "./tamagui.config";

import { AuthPage } from "./pages/auth/AuthPage";

export default function App() {
  return (
    <TamaguiProvider config={config} defaultTheme="light">
      <AuthPage />
    </TamaguiProvider>
  );
}
