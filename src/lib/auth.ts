import type { User } from "@/types/User";
import { jwtDecode } from "jwt-decode";

export default function getAuthUser(): User | null {
  const token = localStorage.getItem("x-auth-token");
  if (!token) return null;

  try {
    const decoded = jwtDecode<User>(token);
    return decoded;
  } catch (error) {
    console.error("Token decoding failed:", error);
    return null;
  }
}
