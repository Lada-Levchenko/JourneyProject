import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { TextField, Typography } from "@mui/material";

export function AuthPanel() {
  return (
    <Stack spacing={2} p={2}>
      <Stack spacing={0.5} textAlign="center">
        <Typography variant="h4">Welcome!</Typography>
        <Typography variant="body2" color="text.secondary">
          Please log in to continue
        </Typography>
      </Stack>

      <Stack spacing={2}>
        <TextField label="Email" type="email" autoComplete="email" fullWidth />

        <TextField
          label="Password"
          type="password"
          autoComplete="current-password"
          fullWidth
        />

        <Button variant="contained" color="secondary">
          LOG IN
        </Button>
      </Stack>
    </Stack>
  );
}
