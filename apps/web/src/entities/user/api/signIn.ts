import { apiFetch, HttpBody } from "@/shared/api/http";
import type { Credentials, AuthResponse } from "../model/types";

export async function signIn(credentials: Credentials) {
  return apiFetch<AuthResponse>("/auth/sign-in", {
    method: "POST",
    body: credentials as unknown as HttpBody,
  });
}
