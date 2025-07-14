import { ProductExceptionCard } from "@/components/productExceptions/ProductExceptionCard";
import type { Entry } from "@/types/Entry";
import type { FilterType } from "@/types/FiltersType";
import type { Product } from "@/types/Product";

type Props = {
  products: Product[];
  damagedMap: Map<string, Entry[]>;
  selectedFilters: FilterType[];
  getRequiredStock: (product: Product) => number;
};

export function ExceptionCardGrid({
  products,
  damagedMap,
  selectedFilters,
  getRequiredStock,
}: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      {products.map((p) => {
        const requiredStock = getRequiredStock(p);

        const severity =
          p.numberInStock === 0
            ? "Critical"
            : p.numberInStock <= requiredStock / 2
            ? "Warning"
            : p.numberInStock <= requiredStock
            ? "Low"
            : undefined;

        const status = [
          p.numberInStock === 0 ? "Out of Stock" : "",
          p.numberInStock > 0 && p.numberInStock <= requiredStock
            ? "Low Stock"
            : "",
          damagedMap.has(p.itemCode) ? "Damaged" : "",
        ].filter(Boolean);

        return (
          <ProductExceptionCard
            key={p.itemCode}
            product={p}
            damages={
              selectedFilters.includes("Damaged")
                ? damagedMap.get(p.itemCode) ?? []
                : []
            }
            status={status}
            severity={
              selectedFilters.includes("Low Stock") ? severity : undefined
            }
          />
        );
      })}
    </div>
  );
}

export default ExceptionCardGrid;
