import ProductTable from "@/components/receive/ProductsTable";
import { ReceiveItemForm } from "@/components/receive/ReceiveItemForm";
import { useState } from "react";

export default function ReceivePage() {
  const [highlightId, setHighlightId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Receive Stock</h2>
      <ReceiveItemForm
        onStockUpdate={(updatedId) => {
          setHighlightId(updatedId);
        }}
      />
      <ProductTable highlightId={highlightId} />
    </div>
  );
}
