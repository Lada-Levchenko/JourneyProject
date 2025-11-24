import { TamaguiProvider, View } from "@tamagui/core";
import TestButton from "./components/TestButton";
import config from "./tamagui.config";
import { Button, YStack } from "tamagui";
import { LinearGradient } from "tamagui/linear-gradient";

export default function App() {
  return (
    <TamaguiProvider config={config} defaultTheme="light">
      <YStack flex={1} items="center" justify="center">
        <Button>Hello world</Button>
        <LinearGradient zIndex={-1} fullscreen colors={["red", "blue"]} />
      </YStack>
      <View width={200} height={200} backgroundColor="$background" />
      <TestButton />
    </TamaguiProvider>
  );
}
