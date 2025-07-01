import orderClient from "@/services/order-client";
import productClient from "@/services/product-client";
import type { Product } from "@/types/Product";
import { CanceledError } from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type FormData = {
  orderNumber: string;
  itemCode: string;
  quantity: number;
};

type Props = {
  onOrderComplete: (orderId: string) => void;
};

export function OrderForm({ onOrderComplete }: Props) {
  const { register, handleSubmit, watch, reset, setFocus } =
    useForm<FormData>();

  const [matchedProduct, setMatchedProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const itemCode = watch("itemCode");

  useEffect(() => {
    if (itemCode?.trim()) {
      const { request, cancel } = productClient.getAll<Product>({ itemCode });

      request
        .then((res) => setMatchedProduct(res.data[0] ?? null))
        .catch((err) => {
          if (err instanceof CanceledError) return;
          console.error("Fetch error:", err);
          setMatchedProduct(null);
        });

      return () => cancel();
    } else {
      setMatchedProduct(null);
    }
  }, [itemCode]);

  useEffect(() => {
    if (matchedProduct) {
      setFocus("quantity");
    }
  }, [matchedProduct, setFocus]);

  const onSubmit = async (data: FormData) => {
    try {
      if (!matchedProduct) {
        setError("Product not found");
        toast.error("Product not found");
        return;
      }

      if (matchedProduct.numberInStock === 0) {
        setError("This item is out of stock");
        toast.error("This item is out of stock");
        return;
      }

      if (data.quantity > matchedProduct.numberInStock) {
        setError("Not enough stock available");
        toast.error("Not enough stock available");
        return;
      }

      const orderRes = await orderClient.create({
        orderNumber: data.orderNumber,
        productId: matchedProduct._id,
        itemCode: matchedProduct.itemCode,
        quantity: data.quantity,
        date: new Date().toISOString(),
      });

      await productClient.patch(matchedProduct._id, {
        numberInStock: matchedProduct.numberInStock - data.quantity,
      });

      window.dispatchEvent(new Event("orders:refresh"));
      window.dispatchEvent(new Event("products:refresh"));

      onOrderComplete(orderRes.data.id);
      reset();
      setMatchedProduct(null);
      setError(null);
      toast.success("Order processed successfully");
    } catch (err) {
      setError("Something went wrong");
      toast.error("Something went wrong");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white p-6 rounded shadow max-w-xl space-y-4"
    >
      <div>
        <label className="text-sm font-medium">Order Number</label>
        <input
          {...register("orderNumber", { required: true })}
          className="w-full border px-3 py-2 rounded mt-1"
          placeholder="e.g. ORD-00123"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Item Code</label>
        <input
          {...register("itemCode", { required: true })}
          className="w-full border px-3 py-2 rounded mt-1"
          placeholder="e.g. CEM-50GREY"
        />
      </div>

      {matchedProduct ? (
        <div className="bg-yellow-50 border p-3 rounded text-sm">
          <p>
            <strong>Item:</strong> {matchedProduct.name}
          </p>
          <p>
            <strong>Available Stock:</strong> {matchedProduct.numberInStock}{" "}
            {matchedProduct.unit}
          </p>
        </div>
      ) : (
        <p className="text-sm text-gray-500">Enter item code to check stock</p>
      )}

      <div>
        <label className="text-sm font-medium">Quantity</label>

        <input
          type="number"
          {...register("quantity", {
            required: true,
            min: 1,
            valueAsNumber: true,
          })}
          disabled={matchedProduct?.numberInStock === 0}
          className="w-full border px-3 py-2 rounded mt-1 disabled:bg-gray-100"
          placeholder="e.g. 10"
        />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Process Order
      </button>
    </form>
  );
}
