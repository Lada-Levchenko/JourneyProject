import { YStack } from "tamagui";

type Props = {
  src: string;
  children?: React.ReactNode;
};

export function BackgroundImage({ src, children }: Props) {
  return (
    <YStack
      fullscreen
      // Implement input sanitization for backgroundImage URL.
      // Verification confirms that Tamagui does not automatically sanitize the backgroundImage property. If src accepts user-controlled input, implement sanitization to prevent XSS attacks—allowlist safe URL schemes, strip javascript: and data: URIs, or validate against expected URL patterns.
      backgroundImage={`url(${src})`}
      backgroundSize="cover"
      backgroundRepeat="no-repeat"
      backgroundPosition="center"
    >
      {children}
    </YStack>
  );
}
