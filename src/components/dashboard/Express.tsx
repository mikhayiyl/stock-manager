import { Link } from "react-router-dom";
import { EmptyState } from "@/components/EmptyState";
import { SkeletonBlock } from "../SkeletonBlock";
import type { Receipt } from "@/types/Receipt";
import { ArrowUpRight, Zap } from "lucide-react";

type Props = {
  receipts: Receipt[];
  isLoading: boolean;
};

export function LatestExpress({ receipts, isLoading }: Props) {
  const latestExpress = receipts
    .filter((receipt) => receipt.isExpress)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  if (isLoading) {
    return <SkeletonBlock variant="card" />;
  }

  if (!latestExpress) {
    return <EmptyState message="No express deliveries yet." />;
  }

  return (
    <section className="min-w-0 rounded-xl border border-slate-200/80 bg-white p-4 text-sm shadow-sm shadow-slate-900/[0.035] sm:p-5">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-100">
          <Zap aria-hidden="true" className="size-[1.125rem]" />
        </span>
        <div>
          <h3 className="font-semibold tracking-tight text-slate-900">
            Express delivery
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">Most recent dispatch</p>
        </div>
      </div>
      <dl className="space-y-3">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <dt className="text-slate-500">Item code</dt>
          <dd className="font-semibold text-slate-800">{latestExpress.itemCode}</dd>
        </div>
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <dt className="text-slate-500">Quantity</dt>
          <dd className="font-semibold tabular-nums text-slate-800">
            {latestExpress.quantity.toLocaleString()}
          </dd>
        </div>
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
          <dt className="shrink-0 text-slate-500">Client</dt>
          <dd className="break-words text-right font-medium text-slate-800">
            {latestExpress.client || "—"}
          </dd>
        </div>
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
          <dt className="shrink-0 text-slate-500">Delivery note</dt>
          <dd className="break-words text-right font-medium text-slate-800">
            {latestExpress.deliveryNote || "—"}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-slate-500">Date</dt>
          <dd className="text-right text-xs font-medium text-slate-700">
            {new Date(latestExpress.date).toLocaleString("en-GB", {
              dateStyle: "medium",
              timeStyle: "short",
              hour12: true,
            })}
          </dd>
        </div>
      </dl>

      <Link
        to="/express"
        className="mt-5 inline-flex items-center gap-1 font-semibold text-emerald-800 transition hover:text-emerald-950 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
      >
        View express deliveries <ArrowUpRight aria-hidden="true" className="size-4" />
      </Link>
    </section>
  );
}
