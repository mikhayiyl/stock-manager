import { useEffect, useState } from "react";
import orderClient from "@/services/order-client";
import type { Order } from "@/types/Order";
import { CanceledError } from "@/services/api-client";

const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  const fetchOrders = () => {
    const { request, cancel } = orderClient.getAll<Order>();
    request
      .then((res) => setOrders(res.data))
      .catch((err) => {
        if (err instanceof CanceledError) return;
        console.error("Order fetch error:", err.mesage);
      });
    return cancel;
  };

  useEffect(() => {
    const cancel = fetchOrders();

    const refresh = () => fetchOrders();
    window.addEventListener("orders:refresh", refresh);

    return () => {
      window.removeEventListener("orders:refresh", refresh);
      cancel?.();
    };
  }, []);

  return { orders };
};

export default useOrders;
