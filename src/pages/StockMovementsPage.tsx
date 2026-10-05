import { isAxiosError } from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import apiClient from "@/services/api-client";
import { StockMovementTable } from "@/components/stock/StockMovementTable";
import useProducts from "@/hooks/useProducts";
import type { PaginatedStockMovements } from "@/types/StockMovement";

const pageSize = 50;

export default function StockMovementsPage() {
  const { products } = useProducts();
  const [movements, setMovements] =
    useState<PaginatedStockMovements | null>(null);
  const [page, setPage] = useState(1);
  const [itemCodeInput, setItemCodeInput] = useState("");
  const [itemCodeFilter, setItemCodeFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const productsByCode = useMemo(
    () => new Map(products.map((product) => [product.itemCode, product])),
    [products],
  );

  const loadMovements = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiClient.get<PaginatedStockMovements>(
          "/stock-movements",
          {
            params: {
              page,
              pageSize,
              ...(itemCodeFilter ? { itemCode: itemCodeFilter } : {}),
            },
            signal,
          },
        );
        setMovements(response.data);
      } catch (err) {
        if (signal?.aborted) return;
        console.error("Failed to load stock movements:", err);
        const responseData = isAxiosError(err) ? err.response?.data : null;
        setError(
          typeof responseData === "string"
            ? responseData
            : "Could not load stock movement history. Please try again.",
        );
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [itemCodeFilter, page],
  );

  useEffect(() => {
    const controller = new AbortController();
    void loadMovements(controller.signal);
    return () => controller.abort();
  }, [loadMovements]);

  useEffect(() => {
    const refresh = () => {
      if (page !== 1) {
        setPage(1);
      } else {
        void loadMovements();
      }
    };
    window.addEventListener("stock-movements:refresh", refresh);
    return () => window.removeEventListener("stock-movements:refresh", refresh);
  }, [loadMovements, page]);

  const applyFilter = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setItemCodeFilter(itemCodeInput.trim());
  };

  const clearFilter = () => {
    setItemCodeInput("");
    setPage(1);
    setItemCodeFilter("");
  };

  const totalPages = movements
    ? Math.ceil(movements.total / movements.pageSize)
    : 0;

  return (
    <div className="min-w-0 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">
          Stock movement history
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Review recorded stock receipts, orders, damage, reversals, and count
          adjustments across your inventory.
        </p>
      </header>

      <form
        onSubmit={applyFilter}
        className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <label
            htmlFor="movement-item-code"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Filter by exact item code
          </label>
          <input
            id="movement-item-code"
            value={itemCodeInput}
            onChange={(event) => setItemCodeInput(event.target.value)}
            maxLength={50}
            placeholder="e.g. ITEM-001"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Apply filter
          </button>
          {itemCodeFilter && (
            <button
              type="button"
              onClick={clearFilter}
              disabled={loading}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Clear
            </button>
          )}
        </div>
      </form>

      <section
        className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
        aria-labelledby="movement-results-heading"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
          <div>
            <h2
              id="movement-results-heading"
              className="text-lg font-semibold text-gray-900"
            >
              Recorded movements
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              {itemCodeFilter
                ? `Showing activity for ${itemCodeFilter}.`
                : "Showing the most recently recorded inventory activity."}
            </p>
          </div>
          {movements && (
            <span className="text-sm text-gray-500">
              {movements.total.toLocaleString()}{" "}
              {movements.total === 1 ? "movement" : "movements"}
            </span>
          )}
        </div>

        {loading ? (
          <p
            className="px-5 py-10 text-center text-sm text-gray-600"
            role="status"
          >
            Loading stock movements...
          </p>
        ) : error ? (
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-8">
            <p className="text-sm text-red-700" role="alert">
              {error}
            </p>
            <button
              type="button"
              onClick={() => void loadMovements()}
              className="text-sm font-medium text-blue-700 underline underline-offset-2"
            >
              Retry
            </button>
          </div>
        ) : !movements?.items.length ? (
          <p className="px-5 py-10 text-center text-sm text-gray-600">
            {itemCodeFilter
              ? "No movements found for this item code."
              : "No ledger entries are available yet. Earlier stock activity was not backfilled."}
          </p>
        ) : (
          <>
            <StockMovementTable
              movements={movements.items}
              showProduct
              unitForMovement={(movement) =>
                productsByCode.get(movement.itemCode)?.unit ?? ""
              }
              productNameForMovement={(movement) =>
                productsByCode.get(movement.itemCode)?.name ?? ""
              }
            />
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 px-5 py-3">
                <p className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((current) => current - 1)}
                    disabled={page <= 1 || loading}
                    className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((current) => current + 1)}
                    disabled={page >= totalPages || loading}
                    className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
