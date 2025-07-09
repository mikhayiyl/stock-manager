import { NavLink } from "react-router-dom";
import { useState } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

const baseLinks = [
  { to: "/", label: "Dashboard" },
  { to: "/stock", label: "Stock List" },
  { to: "/orders", label: "Orders" },
  { to: "/receive", label: "Receive Items" },
  { to: "/alert", label: "Product Alert Report" },
  { to: "/salestrend", label: "Sales Trend" },
  { to: "/reports", label: "Reports" },
  { to: "/damages", label: "Damages" },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const isLoggedIn = Boolean(localStorage.getItem("x-auth-token"));

  const authLink = isLoggedIn
    ? { to: "/logout", label: "Sign out" }
    : { to: "/login", label: "Sign in" };

  const links = [...baseLinks, authLink];

  return (
    <>
      <button
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-md bg-background border border-border shadow-md focus:outline-none focus:ring focus:ring-primary"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        {open ? (
          <XMarkIcon className="w-6 h-6 text-primary" />
        ) : (
          <Bars3Icon className="w-6 h-6 text-primary" />
        )}
      </button>

      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-background border-r
          transform md:translate-x-0 transition-transform duration-300 ease-in-out
          ${
            open ? "translate-x-0" : "-translate-x-full"
          } md:static md:translate-x-0
        `}
      >
        <nav className="p-6 space-y-4 mt-12 md:mt-0">
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `block rounded-md px-3 py-2 font-medium ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-primary/10"
                }`
              }
              onClick={() => setOpen(false)}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
