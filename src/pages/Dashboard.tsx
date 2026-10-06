import { RecentMovements } from "@/components/dashboard/RecentMovements";
import { SummaryCards } from "@/components/dashboard/SummaryCard";
import { LatestExpress } from "@/components/dashboard/Express";
import useOrders from "@/hooks/useOrders";
import useProducts from "@/hooks/useProducts";
import useReceipts from "@/hooks/useReceipts";
import {
  ArrowUpRight,
  Boxes,
  FileBarChart2,
  PackagePlus,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function DashboardPage() {
  const { products, isLoading: productsLoading } = useProducts();
  const { orders, isLoading: ordersLoading } = useOrders();
  const { receipts, isLoading: receiptsLoading } = useReceipts();
  const isLoading = productsLoading || ordersLoading || receiptsLoading;
  const today = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="mx-auto max-w-[1600px] space-y-7">
      <section className="relative isolate overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 px-5 py-6 text-white shadow-xl shadow-slate-900/10 sm:px-8 sm:py-8">
        <div
          aria-hidden="true"
          className="absolute -right-16 -top-28 -z-10 size-80 rounded-full bg-emerald-400/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-32 right-1/3 -z-10 size-64 rounded-full bg-cyan-400/10 blur-3xl"
        />
        <div className="flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3 py-1.5 text-xs font-medium text-emerald-100">
              <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
              BUSINESS OVERVIEW
            </div>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Inventory, in focus.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
              A clear view of what you have, what needs attention, and what's
              moving through your business.
            </p>
            <p className="mt-5 text-xs font-medium tracking-wide text-slate-400">
              {today}
            </p>
          </div>

          <nav
            aria-label="Dashboard quick actions"
            className="flex flex-wrap gap-2.5"
          >
            <Link
              to="/receive"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-emerald-400 px-4 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-950/20 transition hover:bg-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              <PackagePlus aria-hidden="true" className="size-4" />
              Receive stock
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
            <Link
              to="/products"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/15 bg-white/[0.07] px-4 text-sm font-medium text-white transition hover:border-white/25 hover:bg-white/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              <Boxes aria-hidden="true" className="size-4" />
              Stock list
            </Link>
            <Link
              to="/reports"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/15 bg-white/[0.07] px-4 text-sm font-medium text-white transition hover:border-white/25 hover:bg-white/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              <FileBarChart2 aria-hidden="true" className="size-4" />
              Reports
            </Link>
            <Link
              to="/insights"
              className="inline-flex min-h-11 items-center  gap-2 rounded-lg border border-white/15 bg-violet-400 px-4 text-sm font-medium text-white transition hover:border-white/25 hover:bg-white/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              <Sparkles aria-hidden="true" className="size-4" />
              Generate AI insights
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
          </nav>
        </div>
      </section>

      <SummaryCards products={products} orders={orders} isLoading={isLoading} />

      <section aria-label="Recent inventory activity" className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-800">
              The latest
            </p>
            <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
              Inventory activity
            </h3>
          </div>
          <Link
            to="/stock-movements"
            className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-emerald-800 transition hover:text-emerald-950 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
          >
            All movements <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <RecentMovements
              products={products}
              receipts={receipts}
              isLoading={isLoading}
            />
          </div>
          <LatestExpress receipts={receipts} isLoading={isLoading} />
        </div>
      </section>
    </div>
  );
}
