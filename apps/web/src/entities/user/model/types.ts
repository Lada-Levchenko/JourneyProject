export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

export interface Credentials {
  email: string;
  password: string;
}

// Response shape from the backend
export interface AuthResponse {
  user: User;
  token?: string; // only if your backend returns JWT, optional
}
