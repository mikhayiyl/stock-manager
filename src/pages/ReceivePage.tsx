import ProductTable from "@/components/receive/ProductsTable";
import { ReceiveItemForm } from "@/components/receive/ReceiveItemForm";
import getAuthUser from "@/lib/auth";
import { useState } from "react";

export default function ReceivePage() {
  const [highlightId, setHighlightId] = useState<string | null>(null);

  const isAdmin = getAuthUser()?.isAdmin;

  return (
    <div className="space-y-6">
      {isAdmin && (
        <>
          <h2 className="text-2xl font-bold">Receive Stock</h2>
          <ReceiveItemForm
            onStockUpdate={(updatedId) => {
              setHighlightId(updatedId);
            }}
          />
        </>
      )}
      <ProductTable highlightId={highlightId} />
    </div>
  );
}
