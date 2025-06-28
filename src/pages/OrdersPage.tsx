import { useState } from "react";
import { OrderForm } from "@/components/orders/OrderForm";
import { OrderTable } from "@/components/orders/OrderTable";

export default function OrdersPage() {
  const [lastOrderId, setLastOrderId] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Process Order</h2>
      <OrderForm onOrderComplete={(id) => setLastOrderId(id)} />
      <OrderTable highlightId={lastOrderId} />
    </div>
  );
}
