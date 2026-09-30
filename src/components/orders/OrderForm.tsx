import orderClient from "@/services/order-client";
import productClient from "@/services/product-client";
import type { Product } from "@/types/Product";
import { CanceledError, isAxiosError } from "axios";
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
  const {
    register,
    handleSubmit,
    watch,
    setFocus,
    reset,
    formState: { errors, isSubmitting },
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

      onOrderComplete(res.data._id);
      reset();
      setMatchedProduct(null);
      setError(null);
      toast.success("Order processed successfully");
    } catch (err) {
      const responseMessage = isAxiosError(err) ? err.response?.data : null;
      const message =
        typeof responseMessage === "string"
          ? responseMessage
          : "Something went wrong";
      setError(message);
      toast.error(message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-xl space-y-4 rounded-md border border-gray-200 bg-white p-5 shadow-sm"
    >
      <div>
        <label className="text-sm font-medium" htmlFor="orderNumber">
          Order number
        </label>
        <input
          id="orderNumber"
          {...register("orderNumber", {
            required: "Order number is required",
            minLength: { value: 1, message: "Order number is required" },
            maxLength: {
              value: 50,
              message: "Order number cannot exceed 50 characters",
            },
          })}
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
          placeholder="e.g. ORD-00123"
        />
        {errors.orderNumber && (
          <p className="mt-1 text-sm text-red-600">
            {errors.orderNumber.message}
          </p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium" htmlFor="itemCode">
          Item code
        </label>
        <input
          id="itemCode"
          {...register("itemCode", {
            required: "Item code is required",
            minLength: {
              value: 5,
              message: "Item code must be at least 5 characters",
            },
            maxLength: {
              value: 50,
              message: "Item code cannot exceed 50 characters",
            },
          })}
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
          placeholder="e.g. CEM-50GREY"
        />
        {errors.itemCode && (
          <p className="mt-1 text-sm text-red-600">{errors.itemCode.message}</p>
        )}
      </div>

      {matchedProduct ? (
        <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm">
          <p>
            <strong>Item:</strong> {matchedProduct.name}
          </p>
          <p>
            <strong>Available Stock:</strong> {matchedProduct.numberInStock}{" "}
            {matchedProduct.unit}
          </p>
        </div>
      ) : (
        <p className="text-sm text-gray-500">
          Enter an item code to check availability.
        </p>
      )}

      <div>
        <label className="text-sm font-medium" htmlFor="quantity">
          Quantity
        </label>

        <input
          id="quantity"
          type="number"
          min={1}
          step={1}
          max={matchedProduct?.numberInStock}
          disabled={matchedProduct?.numberInStock === 0}
          {...register("quantity", {
            valueAsNumber: true,
            required: "Quantity is required",
            validate: {
              wholeNumber: (value) =>
                Number.isInteger(value) || "Enter a whole number",
              positive: (value) => value >= 1 || "Quantity must be at least 1",
              availableStock: (value) =>
                !matchedProduct ||
                value <= matchedProduct.numberInStock ||
                `Cannot exceed available stock of ${matchedProduct.numberInStock}`,
            },
          })}
          className="mt-1 w-full rounded border border-gray-300 px-3 py-2 disabled:bg-gray-100"
        />

        {errors.quantity ? (
          <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
        ) : (
          matchedProduct && (
            <p className="mt-1 text-sm text-gray-600">
              Stock remaining after order:{" "}
              {Math.max(
                matchedProduct.numberInStock - (Number(watch("quantity")) || 0),
                0,
              )}{" "}
              {matchedProduct.unit}
            </p>
          )
        )}
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={isSubmitting || matchedProduct?.numberInStock === 0}
        className="rounded-md bg-green-700 px-4 py-2 font-medium text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Processing..." : "Create order"}
      </button>
    </form>
  );
}
