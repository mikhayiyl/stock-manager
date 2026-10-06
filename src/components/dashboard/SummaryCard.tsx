import {
  REORDER_COVER_DAYS,
  useLowStockAnalysis,
} from "@/hooks/useLowStockAnalysis";
import type { Order } from "@/types/Order";
import type { Product } from "@/types/Product";
import {
  AlertTriangle,
  Boxes,
  Package,
  PackageX,
  ShieldAlert,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

type Metric = {
  title: string;
  value: number;
  description: string;
  Icon: LucideIcon;
  color: string;
  accent: string;
  href?: string;
  linkLabel?: string;
  linkAriaLabel?: string;
};

type Props = {
  products: Product[];
  orders: Order[];
  isLoading: boolean;
};

export function SummaryCards({ products, orders, isLoading }: Props) {
  const { isLowStock } = useLowStockAnalysis(orders);
  const metrics: Metric[] = [
    {
      title: "Products",
      value: products.length,
      description: "In your catalog",
      Icon: Package,
      color: "text-emerald-800 bg-emerald-50 ring-emerald-100",
      accent: "before:bg-emerald-500",
      href: "/products",
      linkLabel: "View",
      linkAriaLabel: "View all products",
    },
    {
      title: "Units on hand",
      value: products.reduce((sum, product) => sum + product.numberInStock, 0),
      description: "Total available inventory",
      Icon: Boxes,
      color: "text-cyan-800 bg-cyan-50 ring-cyan-100",
      accent: "before:bg-cyan-500",
    },
    {
      title: "Low stock",
      value: products.filter(isLowStock).length,
      description: `At or below ${REORDER_COVER_DAYS}-day cover`,
      Icon: AlertTriangle,
      color: "text-amber-800 bg-amber-50 ring-amber-100",
      accent: "before:bg-amber-500",
      href: "/products?status=low-stock",
      linkLabel: "View",
      linkAriaLabel: "View low-stock products",
    },
    {
      title: "Out of stock",
      value: products.filter((product) => product.numberInStock <= 0).length,
      description: "Need replenishment",
      Icon: PackageX,
      color: "text-rose-800 bg-rose-50 ring-rose-100",
      accent: "before:bg-rose-500",
      href: "/products?status=out-of-stock",
      linkLabel: "View",
      linkAriaLabel: "View out-of-stock products",
    },
    {
      title: "Damaged units",
      value: products.reduce((sum, product) => sum + product.damaged, 0),
      description: "Marked as damaged",
      Icon: ShieldAlert,
      color: "text-orange-800 bg-orange-50 ring-orange-100",
      accent: "before:bg-orange-500",
    },
  ];

  return (
    <div
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5 xl:gap-4"
      aria-busy={isLoading}
    >
      {metrics.map((metric) => (
        <MetricCard key={metric.title} {...metric} isLoading={isLoading} />
      ))}
    </div>
  );
}

function MetricCard({
  title,
  value,
  description,
  Icon,
  color,
  accent,
  href,
  linkLabel,
  linkAriaLabel,
  isLoading,
}: {
  title: string;
  value: number;
  description: string;
  Icon: LucideIcon;
  color: string;
  accent: string;
  href?: string;
  linkLabel?: string;
  linkAriaLabel?: string;
  isLoading: boolean;
}) {
  return (
    <article
      className={`relative min-w-0 overflow-hidden rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/[0.035] before:absolute before:inset-x-0 before:top-0 before:h-1 ${accent} transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/[0.07] sm:p-5`}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium text-slate-600">{title}</h3>
        <span
          className={`grid size-10 shrink-0 place-items-center rounded-xl ring-1 ring-inset ${color}`}
        >
          <Icon aria-hidden="true" className="size-[1.125rem]" />
        </span>
      </div>
      {isLoading ? (
        <div
          aria-hidden="true"
          className="mt-5 h-9 w-20 animate-pulse rounded-md bg-slate-100"
        />
      ) : (
        <>
          <p className="mt-4 break-words text-3xl font-semibold tracking-tight tabular-nums text-slate-950">
            {value.toLocaleString()}
          </p>
          <div className="mt-2 flex min-w-0 items-center justify-between gap-2">
            <p className="min-w-0 truncate text-xs leading-5 text-slate-500">
              {description}
            </p>
            {href && linkLabel && linkAriaLabel && (
              <Link
                to={href}
                aria-label={linkAriaLabel}
                className="shrink-0 text-xs font-semibold text-emerald-800 underline-offset-2 hover:text-emerald-950 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
              >
                {linkLabel}
              </Link>
            )}
          </div>
        </>
      )}
    </article>
  );
}
