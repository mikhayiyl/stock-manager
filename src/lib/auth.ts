import { jwtDecode } from "jwt-decode";

type JwtPayload = {
  role?: string;
  [key: string]: any;
};

export function getUserRole(): string | null {
  const token = localStorage.getItem("x-auth-token");
  if (!token) return null;

  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.role || null;
  } catch {
    return null;
  }
}
