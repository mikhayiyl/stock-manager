import { useEffect, useState } from "react";
import { ReceiveItemForm } from "@/components/receive/ReceiveItemForm";
import { ProductTable } from "@/components/receive/ProductsTable";
import productClient from "@/services/product-client";
import type { Product } from "@/types/Product";

export default function ReceivePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      const { request } = productClient.getAll<Product>();
      const res = await request;
      const sorted = res.data.sort(
        (a, b) =>
          new Date(b.received).getTime() - new Date(a.received).getTime()
      );
      setProducts(sorted);
    };

    fetchProducts();
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
