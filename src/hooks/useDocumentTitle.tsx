import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function useDocumentTitle() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;

    const titles: Record<string, string> = {
      "/": "Dashboard",
      "/stock": "Stock List",
      "/orders": "Orders",
      "/receive": "Receive Items",
      "/alert": "Product Alerts",
      "/salestrend": "Sales Trend",
      "/reports": "Reports",
      "/login": "Sign In",
      "/logout": "Signing Out...",
    };

    if (path.startsWith("/product/")) {
      document.title = "Product Details";
    } else {
      document.title = titles[path] || "Stock Manager";
    }
  }, [location]);
}
