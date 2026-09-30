import type {
  StockHealthBadge,
  StockHealthInsight,
} from "@/hooks/useStockHealthInsights";

type Props = StockHealthInsight;
type CardProps = Props & { rank?: number };

const badgeColor: Record<StockHealthBadge, string> = {
  Critical: "bg-red-100 text-red-800",
  Warning: "bg-amber-100 text-amber-900",
  Slow: "bg-gray-100 text-gray-700",
  Healthy: "bg-green-100 text-green-800",
};

export default function StockHealthCard({
  product,
  badge,
  lastSold,
  requiredStock,
  averageDailySales,
  rank,
}: CardProps) {
  return (
    <article className="min-w-0 space-y-3 rounded-md border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="break-words text-base font-semibold text-gray-900">
            {product.name}
          </h3>
          <p className="mt-1 font-mono text-xs text-gray-500">
            {product.itemCode}
          </p>
        </div>
        <span
          className={`shrink-0 rounded px-2 py-1 text-xs font-medium ${badgeColor[badge]}`}
        >
          {rank === undefined ? badge : `Rank #${rank}`}
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-gray-500">On hand</dt>
          <dd className="font-semibold tabular-nums text-gray-900">
            {product.numberInStock.toLocaleString()}
          </dd>
        </div>
        <div>
          <dt className="text-gray-500">
            {badge === "Slow"
              ? "Avg units sold/day (30d)"
              : "7-day stock target"}
          </dt>
          <dd className="font-semibold tabular-nums text-gray-900">
            {badge === "Slow"
              ? averageDailySales.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              : requiredStock.toLocaleString()}
          </dd>
        </div>
      </dl>

      {lastSold ? (
        <p className="text-sm text-gray-600">
          Last sold{" "}
          {new Date(lastSold).toLocaleDateString("en-GB", {
            dateStyle: "medium",
          })}
        </p>
      ) : (
        <p className="text-sm italic text-gray-500">No recorded sales</p>
      )}
    </article>
  );
}
