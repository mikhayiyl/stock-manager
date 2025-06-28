import axios from "axios";
import { useEffect, useState } from "react";
import type { Product } from "@/types/Product";

export function LatestArrival() {
  const [latest, setLatest] = useState<Product | null>(null);

  useEffect(() => {
    axios.get("http://localhost:3001/products").then((res) => {
      const sorted = res.data.sort(
        (a: Product, b: Product) =>
          new Date(b.received).getTime() - new Date(a.received).getTime()
      );
      setLatest(sorted[0]);
    });
  }, []);

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
