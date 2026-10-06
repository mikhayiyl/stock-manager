import { isAxiosError } from "axios";
import { useCallback, useEffect, useState } from "react";
import apiClient from "@/services/api-client";
import type {
  PaginatedStockMovements,
  StockMovement,
} from "@/types/StockMovement";
import { StockMovementTable } from "@/components/stock/StockMovementTable";

const pageSize = 20;

type Props = {
  productId: string;
  unit: string;
};

export function StockMovementHistory({ productId, unit }: Props) {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMovements = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get<PaginatedStockMovements>(
          "/stock-movements",
          { params: { productId, page, pageSize }, signal },
        );
        setMovements(response.data.items);
        setTotal(response.data.total);
      } catch (err) {
        if (signal?.aborted) return;
        console.error("Failed to load stock movement history:", err);
        const responseData = isAxiosError(err) ? err.response?.data : null;
        setError(
          typeof responseData === "string"
            ? responseData
            : "Could not load the stock movement history.",
        );
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [page, productId],
  );

  useEffect(() => {
    const controller = new AbortController();
    void loadMovements(controller.signal);
    return () => controller.abort();
  }, [loadMovements]);

  useEffect(() => {
    const refresh = () => void loadMovements();
    window.addEventListener("stock-movements:refresh", refresh);
    return () => window.removeEventListener("stock-movements:refresh", refresh);
  }, [loadMovements]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <section
      className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm"
      aria-labelledby="stock-movement-heading"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
        <div>
          <h2
            id="stock-movement-heading"
            className="text-lg font-semibold text-gray-900"
          >
            Stock movement history
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Auditable record of inventory changes.
          </p>
        </div>
        {total > 0 && (
          <span className="text-sm text-gray-500">
            {total.toLocaleString()} {total === 1 ? "movement" : "movements"}
          </span>
        )}
      </div>

      {loading ? (
        <p className="px-5 py-8 text-center text-sm text-gray-600" role="status">
          Loading movement history...
        </p>
      ) : error ? (
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-6">
          <p className="text-sm text-red-700" role="alert">
            {error}
          </p>
          <button
            type="button"
            onClick={() => void loadMovements()}
            className="text-sm font-medium text-emerald-800 underline underline-offset-2"
          >
            Retry
          </button>
        </div>
      ) : movements.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-gray-600">
          No ledger entries are available yet. This history starts when ledger
          tracking is enabled; earlier stock activity is not included.
        </p>
      ) : (
        <>
          <StockMovementTable movements={movements} unitForMovement={() => unit} />
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3">
              <p className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((current) => current - 1)}
                  disabled={page <= 1 || loading}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setPage((current) => current + 1)}
                  disabled={page >= totalPages || loading}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
