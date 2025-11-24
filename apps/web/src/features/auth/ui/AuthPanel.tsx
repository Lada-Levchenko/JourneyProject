import { Button } from "@/shared/ui/Button";
import { Card, H4, Input, Paragraph, YStack } from "tamagui";
import { colors } from "@/shared/tokens/design";

export function AuthPanel() {
  return (
    <YStack gap="$4" padding="16px">
      <Card.Header padded alignItems="center">
        <H4>Welcome!</H4>
        <Paragraph>Please log in to continue</Paragraph>
      </Card.Header>
      <YStack gap="$4">
        <Input
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          aria-label="Email"
          borderRadius={0}
        />

        <Input
          placeholder="Password"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="current-password"
          aria-label="Password"
          borderRadius={0}
        />

        <Button
          onPress={() => console.log("signing in…")}
          backgroundColor={colors.secondary.main}
          color={colors.secondary.contrastText}
          borderRadius={4}
        >
          LOG IN
        </Button>
      </YStack>
    </YStack>
  );
}
