import { AuthPanel } from "@/features/auth/ui/AuthPanel";
import { CenterPaneLayout } from "@/shared/layouts/CenterPaneLayout";
import { BackgroundImageLayout } from "@/shared/layouts/BackgroundImageLayout";

export function AuthPage() {
  return (
    <BackgroundImageLayout src="/images/auth-bg.png">
      <CenterPaneLayout>
        <AuthPanel />
      </CenterPaneLayout>
    </BackgroundImageLayout>
  );
}
