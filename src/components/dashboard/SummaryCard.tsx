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
      color: "text-blue-700 bg-blue-50",
      accent: "border-t-blue-500",
      href: "/products",
      linkLabel: "View",
      linkAriaLabel: "View all products",
    },
    {
      title: "Units on hand",
      value: products.reduce((sum, product) => sum + product.numberInStock, 0),
      description: "Total available inventory",
      Icon: Boxes,
      color: "text-teal-700 bg-teal-50",
      accent: "border-t-teal-500",
    },
    {
      title: "Low stock",
      value: products.filter(isLowStock).length,
      description: `At or below ${REORDER_COVER_DAYS}-day cover`,
      Icon: AlertTriangle,
      color: "text-amber-700 bg-amber-50",
      accent: "border-t-amber-500",
      href: "/products?status=low-stock",
      linkLabel: "View",
      linkAriaLabel: "View low-stock products",
    },
    {
      title: "Out of stock",
      value: products.filter((product) => product.numberInStock <= 0).length,
      description: "Need replenishment",
      Icon: PackageX,
      color: "text-red-700 bg-red-50",
      accent: "border-t-red-500",
      href: "/products?status=out-of-stock",
      linkLabel: "View",
      linkAriaLabel: "View out-of-stock products",
    },
    {
      title: "Damaged units",
      value: products.reduce((sum, product) => sum + product.damaged, 0),
      description: "Marked as damaged",
      Icon: ShieldAlert,
      color: "text-orange-700 bg-orange-50",
      accent: "border-t-orange-500",
    },
  ];

  return (
    <div
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5 xl:gap-4"
      aria-busy={isLoading}
    >
      {metrics.map((metric) => (
        <MetricCard
          key={metric.title}
          {...metric}
          isLoading={isLoading}
        />
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
      className={`min-w-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md ${accent}`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="pt-1 text-sm font-medium text-gray-600">{title}</h3>
        <span
          className={`grid size-9 shrink-0 place-items-center rounded-md ${color}`}
        >
          <Icon aria-hidden="true" className="size-5" />
        </span>
      </div>
      {isLoading ? (
        <div
          aria-hidden="true"
          className="mt-3 h-8 w-16 animate-pulse rounded bg-gray-100"
        />
      ) : (
        <>
          <p className="mt-2 break-words text-2xl font-semibold tabular-nums text-gray-900">
            {value.toLocaleString()}
          </p>
          <div className="mt-2 flex min-w-0 items-center justify-between gap-1">
            <p className="min-w-0 truncate text-xs leading-5 text-gray-500">
              {description}
            </p>
            {href && linkLabel && linkAriaLabel && (
              <Link
                to={href}
                aria-label={linkAriaLabel}
                className="shrink-0 text-xs font-medium text-blue-700 underline-offset-2 hover:text-blue-900 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
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
