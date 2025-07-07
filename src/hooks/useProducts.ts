import { useEffect, useState } from "react";
import productClient from "@/services/product-client";
import type { Product } from "@/types/Product";
import { CanceledError } from "@/services/api-client";

const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = () => {
    setIsLoading(true);
    const { request, cancel } = productClient.getAll<Product>();

    request
      .then((res) => setProducts(res.data))
      .catch((err) => {
        if (err instanceof CanceledError) return;
        console.error("Fetch error:", err);
      })
      .finally(() => setIsLoading(false));

    return cancel;
  };

  useEffect(() => {
    const cancel = fetchProducts();

    const handleRefresh = () => {
      fetchProducts();
    };

    window.addEventListener("products:refresh", handleRefresh);
    return () => {
      window.removeEventListener("products:refresh", handleRefresh);
      cancel?.();
    };
  }, []);

  return { products, isLoading };
};

export default useProducts;
