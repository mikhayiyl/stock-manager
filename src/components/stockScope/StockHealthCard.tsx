type Props = {
  product: { itemCode: string; name: string; numberInStock: number };
  badge: "Critical" | "Warning" | "Slow";
  lastSold: number | undefined;
  requiredStock: number;
};

export default function StockHealthCard({
  product,
  badge,
  lastSold,
  requiredStock,
}: Props) {
  const badgeColor = {
    Critical: "bg-red-200 text-red-800",
    Warning: "bg-yellow-200 text-yellow-800",
    Slow: "bg-gray-200 text-gray-700",
    Healthy: "bg-green-100 text-green-800",
  }[badge];

  return (
    <div className="border rounded p-4 shadow-sm space-y-2 bg-white">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">{product.name}</h2>
          <p className="text-sm text-gray-500">{product.itemCode}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded ${badgeColor}`}>
          {badge}
        </span>
      </div>

      <p className="text-sm text-gray-600">
        Stock: <strong>{product.numberInStock}</strong> / Needed:{" "}
        {requiredStock}
      </p>

      {lastSold ? (
        <p className="text-sm text-gray-600">
          Last sold: {new Date(lastSold).toLocaleDateString()}
        </p>
      ) : (
        <p className="text-sm text-gray-400 italic">No recorded sales</p>
      )}
    </div>
  );
}
