import productClient from "@/services/product-client";
import type { Product } from "@/types/Product";
import { CanceledError } from "@/services/api-client";
import { useEffect, useState } from "react";

const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);

  const fetchProducts = () => {
    const { request, cancel } = productClient.getAll<Product>();
    request
      .then((res) => setProducts(res.data))
      .catch((err) => {
        if (err instanceof CanceledError) return;
        console.error("Fetch error:", err);
      });
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

  return { products };
};

export default useProducts;
