import { useState } from "react";
import { OrderForm } from "@/components/orders/OrderForm";
import { OrderTable } from "@/components/orders/OrderTable";
import getAuthUser from "@/lib/auth";

export default function OrdersPage() {
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const isAdmin = getAuthUser()?.isAdmin;

  return (
    <div className="space-y-6">
      {isAdmin && (
        <>
          <h2 className="text-2xl font-bold">Process Order</h2>
          <OrderForm onOrderComplete={(id) => setLastOrderId(id)} />
        </>
      )}
      <OrderTable highlightId={lastOrderId} />
    </div>
  );
}
