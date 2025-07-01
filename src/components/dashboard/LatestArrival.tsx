import useProducts from "@/hooks/useProducts";

export function LatestArrival() {
  const { products } = useProducts();

  const latest =
    products.sort(
      (a, b) => new Date(b.received).getTime() - new Date(a.received).getTime()
    )[0] || [];

  if (!latest) return null;

  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="text-lg font-semibold mb-2">Latest Arrival</h3>
      <p className="text-sm">
        <strong>Item:</strong> {latest.name}
      </p>
      <p className="text-sm">
        <strong>Code:</strong> {latest.itemCode}
      </p>
      <p className="text-sm">
        <strong>Date Received:</strong> {latest.received}
      </p>
      <p className="text-sm">
        <strong>Quantity:</strong> {latest.numberInStock} {latest.unit}
      </p>
    </div>
  );
}
