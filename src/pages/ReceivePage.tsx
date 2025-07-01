import { useEffect, useState } from "react";
import { ReceiveItemForm } from "@/components/receive/ReceiveItemForm";
import { ProductTable } from "@/components/receive/ProductsTable";
import productClient from "@/services/product-client";
import type { Product } from "@/types/Product";
import { CanceledError } from "axios";

export default function ReceivePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  useEffect(() => {
    const { request } = productClient.getAll<Product>();
    request
      .then((res) =>
        res.data.sort(
          (a, b) =>
            new Date(b.received).getTime() - new Date(a.received).getTime()
        )
      )
      .then((data) => setProducts(data))
      .catch((error) => {
        if (error instanceof CanceledError) return;
        console.log(error.message);
      });
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Receive Stock</h2>
      <ReceiveItemForm
        onStockUpdate={(updatedProducts, updatedId) => {
          setProducts(updatedProducts);
          setHighlightId(updatedId);
        }}
      />
      <ProductTable products={products} highlightId={highlightId} />
    </div>
  );
}
