import { useLocation } from "react-router-dom";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/orders": "Orders",
  "/stock": "Stock List",
  "/products": "Stock List",
  "/stock-movements": "Stock Movements",
  "/receive": "Received Items",
  "/stock-scope": "Stock Scope",
  "/users": "Users",
  "/salestrend": "Sales Trend",
  "/damages": "Damages",
  "/reports": "Reports",
  "/express": "Express Deliveries",
};

export function Header() {
  const { pathname } = useLocation();
  const title =
    pageTitles[pathname] ??
    (pathname.startsWith("/product/") ? "Product Details" : "Stock Manager");

  return (
    <header className="no-print flex h-16 w-full items-center justify-between border-b border-gray-200/80 bg-white/90 px-4 shadow-[0_1px_3px_rgba(15,23,42,0.03)] backdrop-blur sm:px-6">
      <div className="ml-12 flex items-center gap-3 sm:ml-16 lg:ml-6">
        <span className="hidden h-8 w-1 rounded-full bg-emerald-500 sm:block" />
        <h1 className="text-base font-semibold tracking-tight text-slate-800 sm:text-lg">
          {title}
        </h1>
      </div>
      <span className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800 sm:inline-flex">
        <span className="size-1.5 rounded-full bg-emerald-500" />
        Inventory workspace
      </span>
    </header>
  );
}
