import { EmptyState } from "@/components/EmptyState";
import { SkeletonBlock } from "../SkeletonBlock";
import type { Receipt } from "@/types/Receipt";
import { ArrowUpRight, CalendarDays, PackageCheck, Zap } from "lucide-react";
import { Link } from "react-router-dom";

type Props = {
  receipts: Receipt[];
  isLoading: boolean;
};

const numberFormat = new Intl.NumberFormat();

function formatNumber(value: number) {
  return numberFormat.format(value);
}

export function LatestExpress({ receipts, isLoading }: Props) {
  const expressReceipts = receipts
    .filter((receipt) => receipt.isExpress)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const latestExpress = expressReceipts[0];

  const expressUnits = expressReceipts.reduce(
    (sum, receipt) => sum + receipt.quantity,
    0,
  );

  if (isLoading) {
    return <SkeletonBlock variant="card" />;
  }

  if (!latestExpress) {
    return <EmptyState message="No express deliveries yet." />;
  }

  return (
    <section className="min-w-0 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/[0.035] sm:p-5 xl:p-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-100">
            <Zap aria-hidden="true" className="size-[1.125rem]" />
          </span>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-violet-700">
              Express activity
            </p>

            <h3 className="mt-1 font-semibold tracking-tight text-slate-900">
              Delivery snapshot
            </h3>
          </div>
        </div>

        <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700">
          {expressReceipts.length}{" "}
          {expressReceipts.length === 1 ? "delivery" : "deliveries"}
        </span>
      </div>

      {/* Business metrics */}
      <div className="mt-5 grid grid-cols-2 gap-3 xl:mt-3">
        <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <PackageCheck aria-hidden="true" className="size-3.5" />
            Express units
          </div>

          <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums text-slate-950">
            {formatNumber(expressUnits)}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <CalendarDays aria-hidden="true" className="size-3.5" />
            Latest
          </div>

          <p className="mt-2 text-sm font-semibold text-slate-900">
            {new Date(latestExpress.date).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Latest delivery */}
      <div className="mt-5 rounded-lg border border-slate-200 p-4 xl:mt-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
              Latest delivery
            </p>

            <p className="mt-1 truncate text-base font-semibold text-slate-900">
              {latestExpress.itemCode}
            </p>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-lg font-semibold tabular-nums text-slate-950">
              {formatNumber(latestExpress.quantity)}
            </p>

            <p className="text-[11px] text-slate-500">units</p>
          </div>
        </div>

        <dl className="mt-4 space-y-2 xl:mt-3">
          <div className="flex items-start justify-between gap-3">
            <dt className="text-xs text-slate-500">Client</dt>
            <dd className="max-w-[65%] break-words text-right text-xs font-medium text-slate-800">
              {latestExpress.client || "—"}
            </dd>
          </div>

          <div className="flex items-start justify-between gap-3">
            <dt className="text-xs text-slate-500">Delivery note</dt>
            <dd className="max-w-[65%] break-words text-right text-xs font-medium text-slate-800">
              {latestExpress.deliveryNote || "—"}
            </dd>
          </div>

          <div className="flex items-center justify-between gap-3">
            <dt className="text-xs text-slate-500">Received</dt>
            <dd className="text-right text-xs font-medium text-slate-700">
              {new Date(latestExpress.date).toLocaleString("en-GB", {
                dateStyle: "medium",
                timeStyle: "short",
                hour12: true,
              })}
            </dd>
          </div>
        </dl>
      </div>

      {/* Footer */}
      <Link
        to="/express"
        className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-emerald-800 transition hover:text-emerald-950 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 xl:mt-3"
      >
        View express deliveries
        <ArrowUpRight aria-hidden="true" className="size-4" />
      </Link>
    </section>
  );
}
