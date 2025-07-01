import useProducts from "@/hooks/useProducts";

export function SummaryCards() {
  const { products } = useProducts();

  const totalItems = products.length;
  const lowStock = products.filter((p) => p.numberInStock < 20).length;
  const totalDamaged = products.reduce((sum, p) => sum + p.damaged, 0);
  const notInStock = products.filter((p) => p.numberInStock === 0).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card title="Total Items" value={totalItems} color="bg-blue-100" />
      <Card title="Low Stock" value={lowStock} color="bg-red-100" />
      <Card title="Total Damaged" value={totalDamaged} color="bg-rose-100" />
      <Card title="Not In Stock" value={notInStock} color="bg-orange-100" />

      <Card title="Fast Movers" value="–" color="bg-green-100" />
      <Card title="Slow Movers" value="–" color="bg-yellow-100" />
    </div>
  );
}

function Card({
  title,
  value,
  color,
}: {
  title: string;
  value: any;
  color: string;
}) {
  return (
    <div className={`p-4 rounded shadow ${color}`}>
      <h4 className="text-sm font-semibold text-gray-600">{title}</h4>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}
