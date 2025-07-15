import StockHealthCard from "./StockHealthCard";

type Props = {
  items: {
    product: { itemCode: string; name: string; numberInStock: number };
    badge: "Critical" | "Warning" | "Slow";
    lastSold: number | undefined;
    requiredStock: number;
  }[];
};

export default function StockHealthCardGrid({ items }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <StockHealthCard key={item.product.itemCode} {...item} />
      ))}
    </div>
  );
}
