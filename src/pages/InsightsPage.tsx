import { useState } from "react";
import axios from "axios";
import {
  ArrowUpRight,
  BarChart3,
  Boxes,
  CircleAlert,
  Clock3,
  ExternalLink,
  Info,
  Lightbulb,
  PackageCheck,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
} from "lucide-react";
import { Link } from "react-router-dom";
import { generateInventoryInsights } from "@/services/insights-client";
import type {
  InsightCategory,
  InsightPriority,
  InventoryInsight,
  InventoryInsightsResponse,
} from "@/types/InventoryInsights";

const numberFormat = new Intl.NumberFormat();

const priorityStyles: Record<InsightPriority, string> = {
  urgent: "border-rose-200 bg-rose-50 text-rose-800",
  watch: "border-amber-200 bg-amber-50 text-amber-800",
  positive: "border-emerald-200 bg-emerald-50 text-emerald-800",
};

const categoryLabels: Record<InsightCategory, string> = {
  replenishment: "Replenishment",
  inventory_health: "Stock health",
  demand: "Demand",
  operations: "Operations",
};

const categoryIcons: Record<InsightCategory, typeof Boxes> = {
  replenishment: PackageCheck,
  inventory_health: ShieldCheck,
  demand: BarChart3,
  operations: Boxes,
};

function number(value: number | undefined | null) {
  return numberFormat.format(value ?? 0);
}

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const response = error.response;

    if (typeof response?.data === "string") {
      return response.data;
    }

    if (response?.status === 401) {
      return "Sign in to generate insights from your inventory.";
    }

    if (response?.status === 503) {
      return "Gemini is not configured yet. Add GEMINI_API_KEY to the API server environment.";
    }

    if (response?.status === 502) {
      return "The inventory data was loaded, but the AI analysis could not be generated. Try again shortly.";
    }
  }

  return "We couldn't generate insights right now. Check your connection and try again.";
}

export default function InsightsPage() {
  const [result, setResult] = useState<InventoryInsightsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  const generate = async () => {
    setIsLoading(true);
    setError("");
    setIsUnauthorized(false);

    try {
      const response = await generateInventoryInsights();
      setResult(response.data);
    } catch (requestError) {
      setError(getErrorMessage(requestError));

      setIsUnauthorized(
        axios.isAxiosError(requestError) &&
          requestError.response?.status === 401,
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-7">
      <InsightHero
        hasResult={Boolean(result)}
        isLoading={isLoading}
        onGenerate={generate}
      />

      {error && <ErrorBanner error={error} isUnauthorized={isUnauthorized} />}

      {result ? <InsightsResults result={result} /> : <EmptyInsightsState />}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* HERO                                                                       */
/* -------------------------------------------------------------------------- */

function InsightHero({
  hasResult,
  isLoading,
  onGenerate,
}: {
  hasResult: boolean;
  isLoading: boolean;
  onGenerate: () => void;
}) {
  return (
    <section className="relative isolate overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 px-5 py-6 text-white shadow-xl shadow-indigo-950/10 sm:px-8 sm:py-8">
      <div
        aria-hidden="true"
        className="absolute -right-16 -top-28 -z-10 size-80 rounded-full bg-violet-400/20 blur-3xl"
      />

      <div className="flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-3 py-1.5 text-xs font-medium text-violet-100">
            <Sparkles aria-hidden="true" className="size-3.5" />
            GEMINI-POWERED ANALYSIS
          </div>

          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Turn inventory data into clear decisions.
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
            Analyze stock levels, recent demand, and operational activity to
            identify the inventory signals that deserve attention.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-slate-400">
            <span className="flex items-center gap-2">
              <Clock3 aria-hidden="true" className="size-3.5" />
              Last 30 days
            </span>

            <span className="flex items-center gap-2">
              <ShieldCheck aria-hidden="true" className="size-3.5" />
              Based on inventory records
            </span>

            <span className="flex items-center gap-2">
              <Lightbulb aria-hidden="true" className="size-3.5" />
              Human-reviewed recommendations
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onGenerate}
          disabled={isLoading}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-violet-300 px-4 text-sm font-semibold text-slate-950 shadow-lg shadow-violet-950/20 transition hover:bg-violet-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-100 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-950 disabled:cursor-wait disabled:opacity-70"
        >
          {isLoading ? (
            <>
              <RefreshCw aria-hidden="true" className="size-4 animate-spin" />
              Reviewing inventory…
            </>
          ) : hasResult ? (
            <>
              <RefreshCw aria-hidden="true" className="size-4" />
              Refresh insights
            </>
          ) : (
            <>
              <Sparkles aria-hidden="true" className="size-4" />
              Generate insights
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </>
          )}
        </button>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* ERROR                                                                      */
/* -------------------------------------------------------------------------- */

function ErrorBanner({
  error,
  isUnauthorized,
}: {
  error: string;
  isUnauthorized: boolean;
}) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900"
    >
      <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0" />

      <div className="min-w-0">
        <p className="font-semibold">Insights unavailable</p>

        <p className="mt-1 break-words text-rose-800">{error}</p>

        {isUnauthorized && (
          <Link
            to="/login"
            className="mt-2 inline-flex items-center gap-1 font-semibold underline underline-offset-2"
          >
            Sign in
            <ArrowUpRight aria-hidden="true" className="size-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* EMPTY STATE                                                                */
/* -------------------------------------------------------------------------- */

function EmptyInsightsState() {
  return (
    <section className="grid min-h-72 place-items-center rounded-2xl border border-dashed border-slate-300 bg-white/70 px-6 py-10 text-center">
      <div className="max-w-lg">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-100">
          <Lightbulb aria-hidden="true" className="size-6" />
        </span>

        <h3 className="mt-4 text-lg font-semibold tracking-tight text-slate-900">
          Your inventory signals are ready to analyze
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Generate an analysis to identify stock risks, demand signals, and
          operational patterns from your inventory records.
        </p>

        <div className="mx-auto mt-5 grid max-w-md grid-cols-1 gap-2 text-left sm:grid-cols-3">
          {["Stock coverage", "Demand activity", "Operations"].map((item) => (
            <div
              key={item}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-600"
            >
              <ShieldCheck
                aria-hidden="true"
                className="mb-1.5 size-4 text-violet-700"
              />
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* RESULTS                                                                    */
/* -------------------------------------------------------------------------- */

function InsightsResults({ result }: { result: InventoryInsightsResponse }) {
  const { metrics } = result;

  const cards = [
    {
      label: "Products",
      value: metrics.totalProducts,
      detail: "In your catalog",
      Icon: Boxes,
      color: "text-emerald-800 bg-emerald-50 ring-emerald-100",
      accent: "before:bg-emerald-500",
    },
    {
      label: "Units on hand",
      value: metrics.totalUnitsOnHand,
      detail: "Available inventory",
      Icon: PackageCheck,
      color: "text-cyan-800 bg-cyan-50 ring-cyan-100",
      accent: "before:bg-cyan-500",
    },
    {
      label: "Low stock",
      value: metrics.lowStockCount,
      detail: "At or below 7-day cover",
      Icon: TriangleAlert,
      color: "text-amber-800 bg-amber-50 ring-amber-100",
      accent: "before:bg-amber-500",
    },
    {
      label: "Out of stock",
      value: metrics.outOfStockCount,
      detail: "Require replenishment",
      Icon: CircleAlert,
      color: "text-rose-800 bg-rose-50 ring-rose-100",
      accent: "before:bg-rose-500",
    },
  ];

  const urgentInsights = result.insights.filter(
    (insight) => insight.priority === "urgent",
  );

  const watchInsights = result.insights.filter(
    (insight) => insight.priority === "watch",
  );

  const positiveInsights = result.insights.filter(
    (insight) => insight.priority === "positive",
  );

  return (
    <>
      <section aria-label="Inventory snapshot">
        <SectionHeading
          eyebrow="Grounded in your data"
          title="Inventory snapshot"
          right={
            <p className="text-xs text-slate-500">
              {result.cached ? "Reused recent analysis" : "Analysis generated"}{" "}
              ·{" "}
              {new Date(result.generatedAt).toLocaleString("en-GB", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          }
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:gap-4">
          {cards.map(({ label, value, detail, Icon, color, accent }) => (
            <article
              key={label}
              className={`relative min-w-0 overflow-hidden rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/[0.035] before:absolute before:inset-x-0 before:top-0 before:h-1 ${accent} sm:p-5`}
            >
              <div className="flex items-center justify-between gap-3">
                <h4 className="text-sm font-medium text-slate-600">{label}</h4>

                <span
                  className={`grid size-9 shrink-0 place-items-center rounded-xl ring-1 ring-inset ${color}`}
                >
                  <Icon aria-hidden="true" className="size-[1.125rem]" />
                </span>
              </div>

              <p className="mt-4 text-3xl font-semibold tracking-tight tabular-nums text-slate-950">
                {number(value)}
              </p>

              <p className="mt-2 truncate text-xs leading-5 text-slate-500">
                {detail}
              </p>
            </article>
          ))}
        </div>

        <ActivityStrip metrics={metrics} />
      </section>

      <PriorityOverview
        urgentCount={urgentInsights.length}
        watchCount={watchInsights.length}
        positiveCount={positiveInsights.length}
        lowStockCount={metrics.lowStockCount}
        outOfStockCount={metrics.outOfStockCount}
      />

      <section aria-label="AI-generated insights" className="space-y-4">
        <SectionHeading
          eyebrow="AI analysis"
          title="Signals worth your attention"
          right={
            <span className="hidden items-center gap-1.5 text-xs font-medium text-slate-500 sm:inline-flex">
              <Clock3 aria-hidden="true" className="size-4 text-violet-700" />
              {result.periodDays}-day view
            </span>
          }
        />

        <ExecutiveSummary summary={result.summary} />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {result.insights.map((insight, index) => (
            <InsightCard
              key={`${insight.category}-${insight.title}-${index}`}
              insight={insight}
            />
          ))}
        </div>

        <div className="flex items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500">
          <Info
            aria-hidden="true"
            className="mt-0.5 size-4 shrink-0 text-slate-400"
          />

          <p>
            AI-generated recommendations are decision support, not automatic
            actions. Inventory metrics are calculated by the stock API; Gemini
            interprets those signals. Verify records and review recommendations
            before acting.
          </p>
        </div>
      </section>

      <InventoryEvidence metrics={metrics} />
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* ACTIVITY STRIP                                                             */
/* -------------------------------------------------------------------------- */

function ActivityStrip({
  metrics,
}: {
  metrics: InventoryInsightsResponse["metrics"];
}) {
  return (
    <div className="mt-3 grid grid-cols-2 overflow-hidden rounded-xl border border-slate-200/80 bg-white/75 sm:grid-cols-5">
      <ActivityItem
        label="Orders"
        value={metrics.ordersLast30Days}
        detail="last 30 days"
      />

      <ActivityItem
        label="Units out"
        value={metrics.unitsOrderedLast30Days}
        detail="ordered"
      />

      <ActivityItem
        label="Units received"
        value={metrics.unitsReceivedLast30Days}
        detail="received"
      />

      <ActivityItem
        label="Damaged"
        value={metrics.damagedUnits}
        detail="units recorded"
      />

      <ActivityItem
        label="Express"
        value={metrics.expressDeliveriesLast30Days}
        detail="deliveries"
      />
    </div>
  );
}

function ActivityItem({
  label,
  value,
  detail,
}: {
  label: string;
  value: number | undefined;
  detail: string;
}) {
  return (
    <div className="border-b border-slate-200/80 px-4 py-3 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
      <p className="text-xs font-medium text-slate-500">{label}</p>

      <p className="mt-1 text-lg font-semibold tabular-nums text-slate-900">
        {number(value)}
      </p>

      <p className="text-[11px] text-slate-400">{detail}</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* PRIORITIES                                                                 */
/* -------------------------------------------------------------------------- */

function PriorityOverview({
  urgentCount,
  watchCount,
  positiveCount,
  lowStockCount,
  outOfStockCount,
}: {
  urgentCount: number;
  watchCount: number;
  positiveCount: number;
  lowStockCount: number;
  outOfStockCount: number;
}) {
  return (
    <section aria-label="Priority overview">
      <SectionHeading eyebrow="Decision queue" title="What needs attention" />

      <div className="grid gap-3 md:grid-cols-3">
        <PriorityCard
          priority="urgent"
          title={
            outOfStockCount > 0
              ? `${number(outOfStockCount)} products need replenishment`
              : urgentCount > 0
                ? `${number(urgentCount)} urgent signal${urgentCount === 1 ? "" : "s"}`
                : "No urgent signals detected"
          }
          detail={
            outOfStockCount > 0
              ? "Some products currently have no available stock."
              : "Review the urgent AI recommendations below."
          }
        />

        <PriorityCard
          priority="watch"
          title={
            lowStockCount > 0
              ? `${number(lowStockCount)} products need attention`
              : watchCount > 0
                ? `${number(watchCount)} signal${watchCount === 1 ? "" : "s"} to watch`
                : "No watch signals detected"
          }
          detail={
            lowStockCount > 0
              ? "Products are at or below the configured 7-day coverage threshold."
              : "No immediate low-stock pressure was detected."
          }
        />

        <PriorityCard
          priority="positive"
          title={
            positiveCount > 0
              ? `${number(positiveCount)} positive signal${positiveCount === 1 ? "" : "s"}`
              : "No positive signals yet"
          }
          detail="Useful patterns identified from recent inventory activity."
        />
      </div>
    </section>
  );
}

function PriorityCard({
  priority,
  title,
  detail,
}: {
  priority: InsightPriority;
  title: string;
  detail: string;
}) {
  const Icon =
    priority === "urgent"
      ? CircleAlert
      : priority === "watch"
        ? TriangleAlert
        : TrendingUp;

  return (
    <article className={`rounded-xl border p-4 ${priorityStyles[priority]}`}>
      <div className="flex items-start gap-3">
        <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0" />

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide">
            {priority}
          </p>

          <h4 className="mt-1 text-sm font-semibold">{title}</h4>

          <p className="mt-1 text-xs leading-5 opacity-80">{detail}</p>
        </div>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/* INVENTORY EVIDENCE                                                          */
/* -------------------------------------------------------------------------- */

function InventoryEvidence({
  metrics,
}: {
  metrics: InventoryInsightsResponse["metrics"];
}) {
  const extendedMetrics = metrics as InventoryMetrics;

  const demandChange =
    extendedMetrics.demandChangePercent ?? extendedMetrics.ordersChangePercent;

  const daysOfCover = extendedMetrics.averageDaysOfCover;

  const hasExtendedData =
    demandChange !== undefined || daysOfCover !== undefined;

  if (!hasExtendedData) {
    return null;
  }

  return (
    <section aria-label="Inventory evidence">
      <SectionHeading
        eyebrow="Evidence"
        title="Signals behind the analysis"
        right={
          <span className="text-xs text-slate-500">
            Calculated from inventory records
          </span>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2">
        {daysOfCover !== undefined && (
          <EvidenceCard
            label="Average stock cover"
            value={`${daysOfCover.toFixed(1)} days`}
            detail="Estimated using recent demand"
            Icon={Clock3}
          />
        )}

        {demandChange !== undefined && (
          <EvidenceCard
            label="Demand change"
            value={`${demandChange >= 0 ? "+" : ""}${demandChange.toFixed(1)}%`}
            detail="Current 30 days vs previous 30 days"
            Icon={demandChange >= 0 ? TrendingUp : TrendingDown}
            positive={demandChange >= 0}
          />
        )}
      </div>
    </section>
  );
}

function EvidenceCard({
  label,
  value,
  detail,
  Icon,
  positive,
}: {
  label: string;
  value: string;
  detail: string;
  Icon: typeof Clock3;
  positive?: boolean;
}) {
  return (
    <article className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/[0.035]">
      <div className="flex items-center gap-2">
        <span className="grid size-8 place-items-center rounded-lg bg-slate-100 text-slate-600">
          <Icon aria-hidden="true" className="size-4" />
        </span>

        <p className="text-xs font-medium text-slate-500">{label}</p>
      </div>

      <p
        className={`mt-3 text-2xl font-semibold tracking-tight ${
          positive === true ? "text-emerald-700" : "text-slate-950"
        }`}
      >
        {value}
      </p>

      <p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/* EXECUTIVE SUMMARY                                                           */
/* -------------------------------------------------------------------------- */

function ExecutiveSummary({ summary }: { summary: string }) {
  return (
    <div className="rounded-xl border border-violet-100 bg-gradient-to-r from-violet-50/80 to-white p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-violet-100 text-violet-800">
          <Sparkles aria-hidden="true" className="size-[1.125rem]" />
        </span>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-800">
            Executive summary
          </p>

          <p className="mt-1.5 text-sm leading-6 text-slate-700">{summary}</p>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* INSIGHT CARD                                                               */
/* -------------------------------------------------------------------------- */

function InsightCard({ insight }: { insight: InventoryInsight }) {
  const CategoryIcon = categoryIcons[insight.category];

  return (
    <article className="min-w-0 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/[0.035] transition hover:border-slate-300 hover:shadow-md sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${priorityStyles[insight.priority]}`}
        >
          {insight.priority}
        </span>

        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
          <CategoryIcon aria-hidden="true" className="size-3.5" />
          {categoryLabels[insight.category]}
        </span>
      </div>

      <h4 className="mt-4 text-base font-semibold tracking-tight text-slate-900">
        {insight.title}
      </h4>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        {insight.observation}
      </p>

      <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Suggested next step
        </p>

        <p className="mt-1 text-sm leading-5 text-slate-700">
          {insight.recommendation}
        </p>
      </div>

      {insight.itemCodes.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Related products
          </p>

          <div className="flex flex-wrap gap-1.5">
            {insight.itemCodes.map((itemCode) => (
              <Link
                key={itemCode}
                to={`/products?search=${encodeURIComponent(itemCode)}`}
                className="group inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 font-mono text-[11px] text-slate-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-800"
              >
                {itemCode}

                <ExternalLink
                  aria-hidden="true"
                  className="size-3 opacity-0 transition group-hover:opacity-100"
                />
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck aria-hidden="true" className="size-3.5" />
          Based on inventory records
        </span>

        {insight.itemCodes.length > 0 && (
          <Link
            to={`/products?search=${encodeURIComponent(insight.itemCodes[0])}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-violet-700 hover:text-violet-900"
          >
            View product
            <ArrowUpRight aria-hidden="true" className="size-3.5" />
          </Link>
        )}
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/* SHARED                                                                     */
/* -------------------------------------------------------------------------- */

function SectionHeading({
  eyebrow,
  title,
  right,
}: {
  eyebrow: string;
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-800">
          {eyebrow}
        </p>

        <h3 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
          {title}
        </h3>
      </div>

      {right}
    </div>
  );
}

type InventoryMetrics = InventoryInsightsResponse["metrics"] & {
  averageDaysOfCover?: number;
  demandChangePercent?: number;
  ordersChangePercent?: number;
};
