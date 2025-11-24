// import { YStack } from "tamagui";
// import { AuthPanel } from "../../features/auth/ui/AuthPanel";
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
//       <AuthPanel />
//       <YStack flex={1} alignContent="center" justifyContent="center">
//         {/* etc */}
//       </YStack>
//     </YStack>
//   );
// }

import { AuthPanel } from "@/features/auth/ui/AuthPanel";
import { BackgroundImage } from "@/shared/ui/BackgroundImage";
import { CenterPane } from "@/shared/ui/CenterPane";

export function AuthPage() {
  return (
    <BackgroundImage src="/images/auth-bg.png">
      <CenterPane>
        <AuthPanel />
      </CenterPane>
    </BackgroundImage>
  );
}
