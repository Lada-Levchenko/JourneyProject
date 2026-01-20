import { ReactNode } from "react";
import Box from "@mui/material/Box";

type Props = {
  src: string;
  children?: ReactNode;
};

export function BackgroundImageLayout({ src, children }: Props) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100%",
        backgroundImage: `url(${src})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      {children}
    </Box>
  );
}
