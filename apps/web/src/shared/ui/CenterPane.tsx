import { YStack, Card } from "tamagui";
import { ReactNode } from "react";
import { colors } from "@/shared/tokens/design";

export function CenterPane({ children }: { children: ReactNode }) {
  return (
    <YStack items="center" justify="center" flex={1}>
      <Card
        elevate
        bordered
        p="16px"
        width={552}
        height={529}
        borderRadius={8} // What is $4?
        backgroundColor={colors.background.whiteTransparent}
        backdropFilter="blur(13.3px)"
      >
        {children}
      </Card>
    </YStack>
  );
}
