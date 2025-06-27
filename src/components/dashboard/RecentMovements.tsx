import { useEffect, useState } from "react";
import axios from "axios";
import type { Product } from "@/types/Product";

export function RecentMovements() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    axios.get<Product[]>("http://localhost:3001/products").then((res) => {
      console.log(res);
      const sorted = [...res.data].sort(
        (a, b) =>
          new Date(b.received).getTime() - new Date(a.received).getTime()
      );
      setProducts(sorted.slice(0, 5));
    });
  }, []);

  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="text-lg font-semibold mb-4">Recent Stock Updates</h3>
      <table className="w-full text-sm">
        <thead className="text-left border-b">
          <tr>
            <th>Code</th>
            <th>Item</th>
            <th>Stock</th>
            <th>Damaged</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-b">
              <td>{p.itemCode}</td>
              <td>{p.name}</td>
              <td>{p.numberInStock}</td>
              <td>{p.damaged}</td>
              <td>{p.received}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
