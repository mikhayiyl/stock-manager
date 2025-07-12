import orderClient from "@/services/order-client";
import productClient from "@/services/product-client";
import type { Product } from "@/types/Product";
import { CanceledError } from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { z } from "zod";

const orderSchema = z.object({
  orderNumber: z.string().min(6, "Order number must be atleast 6 characters"),
  itemCode: z.string().min(5, "Item code must be atleast 5 digits"),
  quantity: z
    .number({ invalid_type_error: "Quantity cannot be empty" })
    .min(1, "Quantity must be at least 1"),
});

type FormData = z.infer<typeof orderSchema>;

type Props = {
  onOrderComplete: (orderId: string) => void;
};

export function OrderForm({ onOrderComplete }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    setFocus,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    mode: "onChange",
  });

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

      const res = await orderClient.create({
        orderNumber: data.orderNumber,
        productId: matchedProduct._id,
        itemCode: matchedProduct.itemCode,
        quantity: data.quantity,
        date: new Date().toISOString(),
      });

      window.dispatchEvent(new Event("orders:refresh"));
      window.dispatchEvent(new Event("products:refresh"));

      onOrderComplete(res.data.id);
      reset();
      setMatchedProduct(null);
      setError(null);
      toast.success("Order processed successfully");
    } catch (err: any) {
      const message = err.response?.data || "Something went wrong";
      setError(message);
      toast.error(message);
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
          {...register("orderNumber")}
          className="w-full border px-3 py-2 rounded mt-1"
          placeholder="e.g. ORD-00123"
        />
        {errors.orderNumber && (
          <p className="text-red-500 text-sm">{errors.orderNumber.message}</p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium">Item Code</label>
        <input
          {...register("itemCode")}
          className="w-full border px-3 py-2 rounded mt-1"
          placeholder="e.g. CEM-50GREY"
        />
        {errors.itemCode && (
          <p className="text-red-500 text-sm">{errors.itemCode.message}</p>
        )}
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
          min={1}
          max={matchedProduct?.numberInStock}
          disabled={matchedProduct?.numberInStock === 0}
          {...register("quantity", {
            valueAsNumber: true,
            required: "Quantity is required",
            validate: (value) =>
              !matchedProduct ||
              value <= matchedProduct.numberInStock ||
              `Cannot exceed available stock of ${matchedProduct.numberInStock}`,
          })}
          className="w-full border px-3 py-2 rounded mt-1 disabled:bg-gray-100"
        />

        {errors.quantity ? (
          <p className="text-red-500 text-sm">{errors.quantity.message}</p>
        ) : (
          matchedProduct && (
            <p className="text-sm text-green-600">✅ Within available stock</p>
          )
        )}
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
