import receiptClient from "@/services/receipt-client";
import type { Receipt } from "@/types/Receipt";
import { CanceledError } from "@/services/api-client";
import { useEffect, useState } from "react";

const useReceipts = () => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);

  useEffect(() => {
    const { request, cancel } = receiptClient.getAll<Receipt>();
    request
      .then((res) => setReceipts(res.data))
      .catch((err) => {
        if (err instanceof CanceledError) return;
        console.error("Fetch error:", err);
      });
    return () => cancel();
  }, []);
  return { receipts };
};

export default useReceipts;
