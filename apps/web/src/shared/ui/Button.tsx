import { Button as TButton, ButtonProps } from "tamagui";

export function Button(props: ButtonProps) {
  return <TButton size="$4" rounded="$4" {...props} />;
}
