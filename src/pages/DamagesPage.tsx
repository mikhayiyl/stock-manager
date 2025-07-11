import DamageCard from "@/components/damages/DamageCard";
import Filters from "@/components/damages/Filters";
import { QuantityModal } from "@/components/damages/QuantityModal";
import useDamages from "@/hooks/useDamages";
import { useDebounce } from "@/hooks/useDebounce";
import useProducts from "@/hooks/useProducts";
import damageClient from "@/services/damage-client";
import type { Damage } from "@/types/Damage";
import { useState } from "react";

export default function DamagePage() {
  const { damages, refresh } = useDamages();
  const { products } = useProducts();

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

  const debouncedFilters = useDebounce(filters, 300);

  const filteredDamages = damages.filter((d) => {
    const matchingProduct = products.find(
      (p) => p.itemCode.toLowerCase() === d.itemCode.toLowerCase()
    );

    const matchesItemCode = debouncedFilters.itemCode
      ? d.itemCode
          .toLowerCase()
          .includes(debouncedFilters.itemCode.toLowerCase())
      : true;

    const matchesName = debouncedFilters.name
      ? matchingProduct?.name
          ?.toLowerCase()
          .includes(debouncedFilters.name.toLowerCase())
      : true;

    const damageDate = new Date(d.date);
    const matchesStartDate = debouncedFilters.startDate
      ? damageDate >= new Date(debouncedFilters.startDate)
      : true;

    const matchesEndDate = debouncedFilters.endDate
      ? damageDate <= new Date(debouncedFilters.endDate + "T23:59:59")
      : true;

    return matchesItemCode && matchesName && matchesStartDate && matchesEndDate;
  });

  const handleResolve = async (
    id: string,
    type: "resolved" | "disposed",
    quantity: number,
    notes?: string
  ) => {
    try {
      await damageClient.patch(`/resolve/${id}`, {
        type,
        quantity,
        notes,
      });
      refresh();
      window.dispatchEvent(new Event("products:refresh"));
    } catch (err) {
      console.error("Failed to resolve damage:", err);
    }
  };

  const totalResolved =
    selectedDamage?.resolutionHistory.reduce((sum, r) => sum + r.quantity, 0) ??
    0;
  const maxQuantity = selectedDamage
    ? selectedDamage.quantity - totalResolved
    : 0;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Damage Reports</h1>

      {/* Filters */}
      <Filters filters={filters} setFilters={setFilters} />

      {/* Damage Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 pt-4">
        {filteredDamages.map((d) => {
          const product = products.find((p) => p.itemCode === d.itemCode);

          return (
            <DamageCard
              key={d._id}
              damage={d}
              product={product}
              onResolve={(damage, type) => {
                setSelectedDamage(damage);
                setResolutionType(type);
              }}
            />
          );
        })}
      </div>

      <QuantityModal
        open={!!selectedDamage}
        max={maxQuantity}
        onClose={() => setSelectedDamage(null)}
        onSubmit={(qty, notes) => {
          if (selectedDamage && resolutionType) {
            handleResolve(selectedDamage._id, resolutionType, qty, notes);
          }
        }}
      />
    </div>
  );
}
