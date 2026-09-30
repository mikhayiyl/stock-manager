import DamageCard from "@/components/damages/DamageCard";
import Filters from "@/components/damages/Filters";
import { QuantityModal } from "@/components/damages/QuantityModal";
import Pagination from "@/components/PaginationBar";
import { EmptyState } from "@/components/EmptyState";
import { SkeletonBlock } from "@/components/SkeletonBlock";
import useDamages from "@/hooks/useDamages";
import { useDebounce } from "@/hooks/useDebounce";
import useProducts from "@/hooks/useProducts";
import damageClient from "@/services/damage-client";
import type { Damage } from "@/types/Damage";
import { isAxiosError } from "axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function DamagePage() {
  const { damages, isLoading: damagesLoading, error, refresh } = useDamages();
  const { products, isLoading: productsLoading } = useProducts();
  const isLoading = damagesLoading || productsLoading;

  const [filters, setFilters] = useState({
    itemCode: "",
    name: "",
    startDate: "",
    endDate: "",
  });
  const [selectedDamage, setSelectedDamage] = useState<Damage | null>(null);
  const [resolutionType, setResolutionType] = useState<
    "resolved" | "disposed" | null
  >(null);
  const [currentPage, setCurrentPage] = useState(1);

  const debouncedFilters = useDebounce(filters, 300);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedFilters]);

  const productsByCode = new Map(
    products.map((product) => [product.itemCode.toLowerCase(), product]),
  );
  const invalidDateRange =
    Boolean(debouncedFilters.startDate && debouncedFilters.endDate) &&
    debouncedFilters.startDate > debouncedFilters.endDate;

  const filteredDamages = invalidDateRange
    ? []
    : damages.filter((damage) => {
        const matchingProduct = productsByCode.get(
          damage.itemCode.toLowerCase(),
        );

        const matchesItemCode = debouncedFilters.itemCode
          ? damage.itemCode
              .toLowerCase()
              .includes(debouncedFilters.itemCode.toLowerCase())
          : true;

        const matchesName = debouncedFilters.name
          ? matchingProduct?.name
              ?.toLowerCase()
              .includes(debouncedFilters.name.toLowerCase())
          : true;

        const damageDate = new Date(damage.date).getTime();
        const matchesStartDate = debouncedFilters.startDate
          ? damageDate >=
            new Date(`${debouncedFilters.startDate}T00:00:00`).getTime()
          : true;

        const matchesEndDate = debouncedFilters.endDate
          ? damageDate <=
            new Date(`${debouncedFilters.endDate}T23:59:59.999`).getTime()
          : true;

        return (
          matchesItemCode && matchesName && matchesStartDate && matchesEndDate
        );
      });

  const handleResolve = async (
    id: string,
    type: "resolved" | "disposed",
    quantity: number,
    notes?: string,
  ): Promise<boolean> => {
    try {
      await damageClient.patch(`resolve/${id}`, {
        type,
        quantity,
        notes,
      });
      refresh();
      window.dispatchEvent(new Event("products:refresh"));
      toast.success(
        type === "resolved" ? "Damage resolved." : "Damage disposed.",
      );
      return true;
    } catch (err) {
      console.error("Failed to resolve damage:", err);
      const responseData = isAxiosError(err) ? err.response?.data : null;
      toast.error(
        typeof responseData === "string"
          ? responseData
          : "Could not update this damage report. Try again.",
      );
      return false;
    }
  };

  const totalResolved =
    selectedDamage?.resolutionHistory.reduce((sum, r) => sum + r.quantity, 0) ??
    0;
  const maxQuantity = selectedDamage
    ? selectedDamage.quantity - totalResolved
    : 0;

  const itemsPerPage = 9;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDamages = filteredDamages.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  return (
    <div className="min-w-0 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Damage reports</h1>
      {invalidDateRange && (
        <p className="text-sm text-red-700" role="alert">
          The start date must be on or before the end date.
        </p>
      )}
      <Filters filters={filters} setFilters={setFilters} />

      {isLoading ? (
        <SkeletonBlock
          variant="card"
          rows={6}
          title="Loading damage reports..."
        />
      ) : error ? (
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <p>{error}</p>
          <button
            type="button"
            onClick={refresh}
            className="font-medium underline underline-offset-2"
          >
            Retry
          </button>
        </section>
      ) : filteredDamages.length === 0 ? (
        <EmptyState
          message={
            damages.length === 0
              ? "No damage reports yet."
              : "No damage reports match these filters."
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {paginatedDamages.map((damage) => (
            <DamageCard
              key={damage._id}
              damage={damage}
              product={productsByCode.get(damage.itemCode.toLowerCase())}
              onResolve={(item, type) => {
                setSelectedDamage(item);
                setResolutionType(type);
              }}
            />
          ))}
        </div>
      )}

      <QuantityModal
        open={!!selectedDamage}
        max={maxQuantity}
        actionType={resolutionType ?? "resolved"}
        onClose={() => {
          setSelectedDamage(null);
          setResolutionType(null);
        }}
        onSubmit={async (qty, notes) => {
          if (!selectedDamage || !resolutionType) return false;
          return handleResolve(selectedDamage._id, resolutionType, qty, notes);
        }}
      />
      <Pagination
        totalItems={filteredDamages.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
