import {
  REORDER_COVER_DAYS,
  useLowStockAnalysis,
} from "@/hooks/useLowStockAnalysis";
import type { Order } from "@/types/Order";
import type { Product } from "@/types/Product";
import {
  AlertTriangle,
  Boxes,
  PackageX,
  ShieldAlert,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

type Trend = {
  value: number;
  label: string;
};

type Metric = {
  title: string;
  value: number;
  description: string;
  Icon: LucideIcon;
  container: string;
  icon: string;
  accent: string;
  href?: string;
  linkLabel?: string;
  linkAriaLabel?: string;
  trend?: Trend;
};

type Props = {
  products: Product[];
  orders: Order[];
  isLoading: boolean;
};

const numberFormat = new Intl.NumberFormat();

function formatNumber(value: number) {
  return numberFormat.format(value);
}

function getOrderStats(orders: Order[]) {
  const now = new Date();

  const currentPeriodStart = new Date(now);
  currentPeriodStart.setDate(now.getDate() - 30);

  const previousPeriodStart = new Date(now);
  previousPeriodStart.setDate(now.getDate() - 60);

  const currentOrders = orders.filter((order) => {
    const date = new Date(order.date);

    if (Number.isNaN(date.getTime())) {
      return false;
    }

    return date >= currentPeriodStart && date <= now;
  });

  const previousOrders = orders.filter((order) => {
    const date = new Date(order.date);

    if (Number.isNaN(date.getTime())) {
      return false;
    }

    return date >= previousPeriodStart && date < currentPeriodStart;
  });

  const currentCount = currentOrders.length;
  const previousCount = previousOrders.length;

  let changePercent = 0;

  if (previousCount > 0) {
    changePercent = ((currentCount - previousCount) / previousCount) * 100;
  } else if (currentCount > 0) {
    changePercent = 100;
  }

  return {
    currentCount,
    changePercent,
  };
}

export function SummaryCards({ products, orders, isLoading }: Props) {
  const { isLowStock } = useLowStockAnalysis(orders);

  const { currentCount: ordersLast30Days, changePercent } =
    getOrderStats(orders);

  const metrics: Metric[] = [
    {
      title: "Units on hand",
      value: products.reduce((sum, product) => sum + product.numberInStock, 0),
      description: "Total available inventory",
      Icon: Boxes,
      container: "bg-cyan-50/55 border-cyan-100/80",
      icon: "bg-cyan-100/80 text-cyan-800 ring-cyan-200/70",
      accent: "bg-cyan-500",
    },
    {
      title: "Orders",
      value: ordersLast30Days,
      description: "Last 30 days",
      Icon: ShoppingCart,
      container: "bg-emerald-50/60 border-emerald-100/80",
      icon: "bg-emerald-100/80 text-emerald-800 ring-emerald-200/70",
      accent: "bg-emerald-500",
      trend: {
        value: changePercent,
        label: "vs previous 30 days",
      },
    },
    {
      title: "Low stock",
      value: products.filter(isLowStock).length,
      description: `At or below ${REORDER_COVER_DAYS}-day cover`,
      Icon: AlertTriangle,
      container: "bg-amber-50/60 border-amber-100/80",
      icon: "bg-amber-100/80 text-amber-800 ring-amber-200/70",
      accent: "bg-amber-500",
      href: "/products?status=low-stock",
      linkLabel: "View",
      linkAriaLabel: "View low-stock products",
    },
    {
      title: "Out of stock",
      value: products.filter((product) => product.numberInStock <= 0).length,
      description: "Need replenishment",
      Icon: PackageX,
      container: "bg-rose-50/55 border-rose-100/80",
      icon: "bg-rose-100/80 text-rose-800 ring-rose-200/70",
      accent: "bg-rose-500",
      href: "/products?status=out-of-stock",
      linkLabel: "View",
      linkAriaLabel: "View out-of-stock products",
    },
    {
      title: "Damaged units",
      value: products.reduce((sum, product) => sum + product.damaged, 0),
      description: "Marked as damaged",
      Icon: ShieldAlert,
      container: "bg-orange-50/55 border-orange-100/80",
      icon: "bg-orange-100/80 text-orange-800 ring-orange-200/70",
      accent: "bg-orange-500",
    },
  ];

  return (
    <section aria-label="Inventory overview">
      <div
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5 xl:gap-4"
        aria-busy={isLoading}
      >
        {metrics.map((metric) => (
          <MetricCard
            key={metric.title}
            metric={metric}
            isLoading={isLoading}
          />
        ))}
      </div>
    </section>
  );
}

function MetricCard({
  metric,
  isLoading,
}: {
  metric: Metric;
  isLoading: boolean;
}) {
  const {
    title,
    value,
    description,
    Icon,
    container,
    icon,
    accent,
    href,
    linkLabel,
    linkAriaLabel,
    trend,
  } = metric;

  const isPositiveTrend = trend ? trend.value >= 0 : false;

  return (
    <article
      className={`relative min-w-0 overflow-hidden rounded-2xl border p-4 shadow-sm shadow-slate-900/[0.025] transition duration-200 sm:p-5 ${container} ${
        href
          ? "hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-900/[0.06]"
          : ""
      }`}
    >
      {/* Top accent */}
      <div
        aria-hidden="true"
        className={`absolute inset-x-0 top-0 h-0.5 ${accent}`}
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="pt-1 text-sm font-medium text-slate-600">{title}</h3>

        <span
          className={`grid size-10 shrink-0 place-items-center rounded-xl ring-1 ring-inset ${icon}`}
        >
          <Icon aria-hidden="true" className="size-[1.125rem]" />
        </span>
      </div>

      {isLoading ? (
        <div
          aria-hidden="true"
          className="mt-5 h-9 w-20 animate-pulse rounded-md bg-white/70"
        />
      ) : (
        <>
          {/* Main value */}
          <p className="mt-4 text-3xl font-semibold tracking-tight tabular-nums text-slate-950">
            {formatNumber(value)}
          </p>

          {/* Description + action */}
          <div className="mt-2 flex min-w-0 items-center justify-between gap-2">
            <p className="min-w-0 truncate text-xs leading-5 text-slate-600/80">
              {description}
            </p>

            {href && linkLabel && linkAriaLabel && (
              <Link
                to={href}
                aria-label={linkAriaLabel}
                className="shrink-0 text-xs font-semibold text-slate-700 underline-offset-2 hover:text-slate-950 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-700"
              >
                {linkLabel}
              </Link>
            )}
          </div>

          {/* Trend */}
          {trend && (
            <div
              className={`mt-3 inline-flex items-center gap-1 text-xs font-semibold ${
                isPositiveTrend ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              {isPositiveTrend ? (
                <TrendingUp aria-hidden="true" className="size-3.5" />
              ) : (
                <TrendingDown aria-hidden="true" className="size-3.5" />
              )}

              <span>
                {isPositiveTrend ? "+" : ""}
                {trend.value.toFixed(1)}%
              </span>

              <span className="font-medium text-slate-500">{trend.label}</span>
            </div>
          )}
        </>
      )}
    </article>
  );
}
