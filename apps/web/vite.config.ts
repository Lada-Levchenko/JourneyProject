import react from "@vitejs/plugin-react-swc";
import { tamaguiPlugin } from "@tamagui/vite-plugin";

export default {
  plugins: [
    react(),
    tamaguiPlugin({
      // points to your tamagui config file
      config: "src/tamagui.config.ts",
      // points to any linked packages or node_modules
      // that have tamagui components to optimize
      components: ["tamagui"],
      // turns on the optimizing compiler
      optimize: true,
    }),
  ].filter(Boolean),
};
