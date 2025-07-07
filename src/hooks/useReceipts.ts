import receiptClient from "@/services/receipt-client";
import type { Receipt } from "@/types/Receipt";
import { CanceledError } from "@/services/api-client";
import { useEffect, useState } from "react";

const useReceipts = () => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchReceipts = () => {
    setIsLoading(true);
    const { request, cancel } = receiptClient.getAll<Receipt>();

    request
      .then((res) => setReceipts(res.data))
      .catch((err) => {
        if (err instanceof CanceledError) return;
        console.error("Fetch error:", err);
      })
      .finally(() => setIsLoading(false));

    return cancel;
  };

  useEffect(() => {
    const cancel = fetchReceipts();

    const handleRefresh = () => {
      fetchReceipts();
    };

    window.addEventListener("receipts:refresh", handleRefresh);
    return () => {
      window.removeEventListener("receipts:refresh", handleRefresh);
      cancel?.();
    };
  }, []);

  return { receipts, isLoading };
};

export default useReceipts;
