import StockHealthCard from "./StockHealthCard";
import { EmptyState } from "@/components/EmptyState";
import type { StockHealthInsight } from "@/hooks/useStockHealthInsights";

type Props = {
  items: StockHealthInsight[];
  emptyMessage: string;
};

export default function StockHealthCardGrid({ items, emptyMessage }: Props) {
  if (items.length === 0) return <EmptyState message={emptyMessage} />;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <StockHealthCard key={item.product.itemCode} {...item} />
      ))}
    </div>
  );
}
