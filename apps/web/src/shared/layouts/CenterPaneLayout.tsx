import { ReactNode } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";

type Props = {
  children: ReactNode;
};

export function CenterPaneLayout({ children }: Props) {
  return (
    <Box
      sx={{
        flex: 1,
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Paper variant="glass-pane" elevation={6}>
        {children}
      </Paper>
    </Box>
  );
}
