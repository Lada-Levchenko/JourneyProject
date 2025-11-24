import { Text, XStack, YStack } from "tamagui";

export default () => (
  <YStack
    flex={1}
    flexWrap="wrap"
    gap="$3"
    backgroundColor="#fff"
    hoverStyle={{
      backgroundColor: "violet",
    }}
  >
    <Text>Hello</Text>
    <Text>World</Text>
  </YStack>
);
