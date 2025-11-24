// import { YStack } from "tamagui";
// import { AuthPane } from "../../features/auth/ui/AuthPane";
// import bg from "../../shared/assets/images/auth-bg.png";

// export function AuthPage() {
//   return (
//     <YStack
//       fullscreen // fills viewport (position: fixed; top/left/right/bottom: 0)
//       backgroundImage={`url(${bg})`}
//       backgroundSize="cover"
//       backgroundRepeat="no-repeat"
//       backgroundPosition="center"
//     >
//       <AuthPane />
//       <YStack flex={1} alignContent="center" justifyContent="center">
//         {/* etc */}
//       </YStack>
//     </YStack>
//   );
// }

import { AuthPane } from "@/features/auth/ui/AuthPane";
import { BackgroundImage } from "@/shared/ui/BackgroundImage";

export function AuthPage() {
  return (
    <BackgroundImage src="/images/auth-bg.png">
      <AuthPane />
    </BackgroundImage>
  );
}
