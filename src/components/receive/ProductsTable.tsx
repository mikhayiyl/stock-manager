import type { Product } from "@/types/Product";

type Props = {
  products: Product[];
  highlightId: string | null;
};

export function ProductTable({ products, highlightId }: Props) {
  return (
    <div className="bg-white p-4 rounded shadow overflow-x-auto">
      <h3 className="text-lg font-semibold mb-4">Latest Received Products</h3>
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-2">Item Code</th>
            <th className="p-2">Name</th>
            <th className="p-2">Stock</th>
            <th className="p-2">Damaged</th>
            <th className="p-2">Unit</th>
            <th className="p-2">Last Received</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr
              key={product._id}
              className={`border-b ${
                product._id === highlightId ? "bg-blue-50 font-semibold" : ""
              }`}
            >
              <td className="p-2 font-mono">{product.itemCode}</td>
              <td className="p-2">{product.name}</td>
              <td className="p-2">{product.numberInStock}</td>
              <td className="p-2">{product.damaged}</td>
              <td className="p-2">{product.unit}</td>
              <td className="p-2">{product.received}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
