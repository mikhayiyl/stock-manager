import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function LogoutPage() {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("x-auth-token");
    window.location.href = "/";
  }, [navigate]);

  return <p className="text-center mt-10 text-gray-600">Logging out...</p>;
}
