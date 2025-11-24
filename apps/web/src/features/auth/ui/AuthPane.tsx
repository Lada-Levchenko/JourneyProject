import { YStack, Card, H3, Input } from "tamagui";

export function AuthPane() {
  return (
    <YStack items="center" justify="center" flex={1} p="$4">
      <Card elevate bordered p="$6" width={350} rounded="$4">
        <YStack gap="$4">
          <H3 text="center">Sign In</H3>

          <Input
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            // autoComplete="email"
            // aria-label="Email"
          />

          <Input
            placeholder="Password"
            secureTextEntry
            // autoCapitalize="none"
            // autoCorrect={false}
            // autoComplete="current-password"
            // aria-label="Password"
          />
        </YStack>
      </Card>
    </YStack>
  );
}
