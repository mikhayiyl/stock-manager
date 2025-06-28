import { useState } from "react";
import { ReceiveItemForm } from "@/components/receive/ReceiveItemForm";
import { ProductTable } from "@/components/receive/ProductsTable";
import type { Product } from "@/types/Product";

export default function ReceivePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [highlightId, setHighlightId] = useState<number | null>(null);

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
