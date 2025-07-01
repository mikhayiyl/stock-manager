import orderClient from "@/services/order-client";
import type { Order } from "@/types/Order";
import { CanceledError } from "@/services/api-client";
import { useEffect, useState } from "react";

const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const { request, cancel } = orderClient.getAll<Order>();
    request
      .then((res) => setOrders(res.data))
      .catch((err) => {
        if (err instanceof CanceledError) return;
        console.error("Fetch error:", err);
      });
    return () => cancel();
  }, []);
  return { orders };
};

export default useOrders;
