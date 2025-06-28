import { useEffect, useState } from "react";
import axios from "axios";
import type { Product } from "@/types/Product";
import { DamageModal } from "@/components/stock/DamageModal";

export default function StockListPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    axios
      .get("http://localhost:3001/products")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Fetch error:", err));
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Stock List</h2>

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 border-b text-left">
            <tr>
              <th className="p-3">Item Code</th>
              <th className="p-3">Name</th>
              <th className="p-3">In Stock</th>
              <th className="p-3">Damaged</th>
              <th className="p-3">Unit</th>
              <th className="p-3">Last Received</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className={
                  product.numberInStock === 0
                    ? "bg-red-50 text-gray-600"
                    : "border-b"
                }
              >
                <td className="p-3 font-mono">{product.itemCode}</td>
                <td className="p-3">{product.name}</td>
                <td className="p-3">{product.numberInStock}</td>
                <td className="p-3">{product.damaged}</td>
                <td className="p-3">{product.unit}</td>
                <td className="p-3">{product.received}</td>
                <td className="p-3">
                  <DamageModal product={product} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {products.length === 0 && (
          <p className="p-4 text-center text-gray-500">No products found.</p>
        )}
      </div>
    </div>
  );
}
