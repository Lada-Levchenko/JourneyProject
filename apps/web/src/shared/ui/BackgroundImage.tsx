import { YStack } from "tamagui";

type Props = {
  src: string;
  children?: React.ReactNode;
};

export function BackgroundImage({ src, children }: Props) {
  return (
    <YStack
      fullscreen
      backgroundImage={`url(${src})`}
      backgroundSize="cover"
      backgroundRepeat="no-repeat"
      backgroundPosition="center"
    >
      {children}
    </YStack>
  );
}
