import {
  AlertTriangle,
  ArrowUpRight,
  PackageX,
  ShieldAlert,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  REORDER_COVER_DAYS,
  useLowStockAnalysis,
} from "@/hooks/useLowStockAnalysis";
import type { Order } from "@/types/Order";
import type { Product } from "@/types/Product";

type Props = {
  products: Product[];
  orders: Order[];
};

export function DashboardAttention({ products, orders }: Props) {
  const { isLowStock } = useLowStockAnalysis(orders);

  const outOfStockCount = products.filter(
    (product) => product.numberInStock <= 0,
  ).length;

  const lowStockCount = products.filter(isLowStock).length;

  const damagedUnits = products.reduce(
    (sum, product) => sum + product.damaged,
    0,
  );

  const hasAttention =
    outOfStockCount > 0 || lowStockCount > 0 || damagedUnits > 0;

  return (
    <section aria-label="What needs attention" className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-800">
            Decision queue
          </p>

          <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
            What needs attention
          </h3>
        </div>

        {!hasAttention && (
          <span className="hidden text-xs font-medium text-emerald-700 sm:block">
            No immediate issues
          </span>
        )}
      </div>

      {hasAttention ? (
        <>
          <div className="grid gap-3 lg:grid-cols-3 xl:hidden">
            <AttentionCard
              tone="urgent"
              Icon={PackageX}
              label="Out of stock"
              value={outOfStockCount}
              description={
                outOfStockCount === 1
                  ? "Product currently has no stock."
                  : "Products currently have no stock."
              }
              href="/products?status=out-of-stock"
              linkLabel="Review stock"
            />

            <AttentionCard
              tone="warning"
              Icon={AlertTriangle}
              label="Low stock"
              value={lowStockCount}
              description={
                lowStockCount === 1
                  ? `Product is at or below ${REORDER_COVER_DAYS}-day cover.`
                  : `Products are at or below ${REORDER_COVER_DAYS}-day cover.`
              }
              href="/products?status=low-stock"
              linkLabel="Review products"
            />

            <AttentionCard
              tone="damage"
              Icon={ShieldAlert}
              label="Damaged inventory"
              value={damagedUnits}
              description={
                damagedUnits === 1
                  ? "Unit is currently marked as damaged."
                  : "Units are currently marked as damaged."
              }
              href="/products"
              linkLabel="View inventory"
            />
          </div>

          <div className="hidden gap-3 xl:grid xl:grid-cols-3">
            <AttentionRow
              tone="urgent"
              Icon={PackageX}
              label="Out of stock"
              value={outOfStockCount}
              href="/products?status=out-of-stock"
              linkLabel="Review"
            />
            <AttentionRow
              tone="warning"
              Icon={AlertTriangle}
              label="Low stock"
              value={lowStockCount}
              href="/products?status=low-stock"
              linkLabel="Review"
            />
            <AttentionRow
              tone="damage"
              Icon={ShieldAlert}
              label="Damaged inventory"
              value={damagedUnits}
              href="/products"
              linkLabel="View"
            />
          </div>
        </>
      ) : (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-4">
          <div className="flex items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
              <ShieldAlert aria-hidden="true" className="size-[1.125rem]" />
            </span>

            <div>
              <p className="text-sm font-semibold text-emerald-900">
                Inventory is in good shape
              </p>

              <p className="mt-0.5 text-xs text-emerald-800/80">
                No stock shortages or damaged inventory require immediate
                attention.
              </p>
            </div>
          </div>

          <Link
            to="/products"
            className="hidden shrink-0 items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950 sm:inline-flex"
          >
            View inventory
            <ArrowUpRight aria-hidden="true" className="size-3.5" />
          </Link>
        </div>
      )}
    </section>
  );
}

function AttentionRow({
  tone,
  Icon,
  label,
  value,
  href,
  linkLabel,
}: {
  tone: "urgent" | "warning" | "damage";
  Icon: typeof PackageX;
  label: string;
  value: number;
  href: string;
  linkLabel: string;
}) {
  const styles = {
    urgent: "bg-rose-100 text-rose-700",
    warning: "bg-amber-100 text-amber-700",
    damage: "bg-orange-100 text-orange-700",
  }[tone];

  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm shadow-slate-900/[0.035]">
      <span
        className={`grid size-9 shrink-0 place-items-center rounded-lg ${styles}`}
      >
        <Icon aria-hidden="true" className="size-4" />
      </span>
      <p className="min-w-0 flex-1 text-xs font-medium text-slate-700">
        {label}
      </p>
      <p className="text-sm font-semibold tabular-nums text-slate-950">
        {value.toLocaleString()}
      </p>
      <Link
        to={href}
        className="shrink-0 text-xs font-semibold text-emerald-800 hover:text-emerald-950"
      >
        {linkLabel}
      </Link>
    </div>
  );
}

function AttentionCard({
  tone,
  Icon,
  label,
  value,
  description,
  href,
  linkLabel,
}: {
  tone: "urgent" | "warning" | "damage";
  Icon: typeof PackageX;
  label: string;
  value: number;
  description: string;
  href: string;
  linkLabel: string;
}) {
  const styles = {
    urgent: {
      container: "border-rose-200 bg-rose-50/60",
      icon: "bg-rose-100 text-rose-700",
      value: "text-rose-900",
      label: "text-rose-800",
      link: "text-rose-800 hover:text-rose-950",
    },
    warning: {
      container: "border-amber-200 bg-amber-50/60",
      icon: "bg-amber-100 text-amber-700",
      value: "text-amber-900",
      label: "text-amber-800",
      link: "text-amber-800 hover:text-amber-950",
    },
    damage: {
      container: "border-orange-200 bg-orange-50/60",
      icon: "bg-orange-100 text-orange-700",
      value: "text-orange-900",
      label: "text-orange-800",
      link: "text-orange-800 hover:text-orange-950",
    },
  }[tone];

  return (
    <article className={`rounded-xl border p-4 sm:p-5 ${styles.container}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={`grid size-10 shrink-0 place-items-center rounded-xl ${styles.icon}`}
          >
            <Icon aria-hidden="true" className="size-[1.125rem]" />
          </span>

          <div className="min-w-0">
            <p
              className={`text-xs font-semibold uppercase tracking-wide ${styles.label}`}
            >
              {label}
            </p>

            <p
              className={`mt-1 text-2xl font-semibold tracking-tight tabular-nums ${styles.value}`}
            >
              {value.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-slate-600">{description}</p>

      <Link
        to={href}
        className={`mt-4 inline-flex items-center gap-1 text-xs font-semibold ${styles.link}`}
      >
        {linkLabel}
        <ArrowUpRight aria-hidden="true" className="size-3.5" />
      </Link>
    </article>
  );
}
