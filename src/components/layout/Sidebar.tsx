import { NavLink } from "react-router-dom";
import { useState } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import {
  Activity,
  ArrowLeftRight,
  Boxes,
  ChartColumn,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogIn,
  LogOut,
  Package,
  PackagePlus,
  TriangleAlert,
  Warehouse,
} from "lucide-react";

const baseLinks = [
  { to: "/", label: "Dashboard", Icon: LayoutDashboard },
  { to: "/orders", label: "Orders", Icon: ClipboardList },
  { to: "/products", label: "Stock List", Icon: Boxes },
  { to: "/stock-movements", label: "Stock Movements", Icon: ArrowLeftRight },
  { to: "/receive", label: "Receive Items", Icon: PackagePlus },
  { to: "/stock-scope", label: "Stock Scope", Icon: Activity },
  { to: "/salestrend", label: "Sales Trend", Icon: ChartColumn },
  { to: "/damages", label: "Damages", Icon: TriangleAlert },
  { to: "/reports", label: "Reports", Icon: FileText },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const isLoggedIn = Boolean(localStorage.getItem("x-auth-token"));

  const authLink = isLoggedIn
    ? { to: "/logout", label: "Sign out", Icon: LogOut }
    : { to: "/login", label: "Sign in", Icon: LogIn };

  const links = [...baseLinks, authLink];

  return (
    <>
      <button
        className="fixed top-4 left-4 z-50 rounded-lg border border-gray-200 bg-white p-2 text-gray-800 shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-600 md:hidden"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        {open ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <Bars3Icon className="h-6 w-6" />
        )}
      </button>

      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 border-r border-[var(--sidebar-border)] bg-[var(--sidebar)] text-[var(--sidebar-foreground)] shadow-xl shadow-slate-950/10
          transform md:translate-x-0 transition-transform duration-300 ease-in-out
          ${
            open ? "translate-x-0" : "-translate-x-full"
          } md:static md:translate-x-0
        `}
      >
        <div className="flex h-full flex-col px-4 py-6">
          <div className="mb-8 flex items-center gap-3 px-2">
            <span className="grid size-10 place-items-center rounded-xl bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)] shadow-sm">
              <Warehouse aria-hidden="true" className="size-5" />
            </span>
            <div>
              <p className="text-sm font-bold tracking-wide text-white">
                STOCK MANAGER
              </p>
              <p className="mt-0.5 text-xs text-slate-300">Inventory workspace</p>
            </div>
          </div>
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Workspace
          </p>
          <nav className="space-y-1">
          {links.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)] shadow-sm"
                    : "text-slate-300 hover:bg-[var(--sidebar-accent)] hover:text-white"
                }`
              }
              onClick={() => setOpen(false)}
            >
              <Icon aria-hidden="true" className="size-[1.125rem] shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
          </nav>
          <div className="mt-auto border-t border-[var(--sidebar-border)] px-3 pt-4">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Package aria-hidden="true" className="size-4" />
              <span>Stock, made simple.</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
