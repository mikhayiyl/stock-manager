import { useForm } from "react-hook-form";
import axios from "axios";
import { useState } from "react";
import type { Product } from "@/types/Product";

type FormData = {
  orderNumber: string;
  itemCode: string;
  quantity: number;
};

type Props = {
  onOrderComplete: (orderId: number) => void;
};

export function OrderForm({ onOrderComplete }: Props) {
  const { register, handleSubmit, reset } = useForm<FormData>();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: FormData) => {
    try {
      const res = await axios.get(
        `http://localhost:3001/products?itemCode=${data.itemCode}`
      );
      const product: Product = res.data[0];

      if (!product) {
        setError("Product not found");
        return;
      }

      if (data.quantity > product.numberInStock) {
        setError("Not enough stock available");
        return;
      }

      // 1. Log order
      const orderRes = await axios.post("http://localhost:3001/orders", {
        orderNumber: data.orderNumber,
        productId: product.id,
        itemCode: product.itemCode,
        quantity: data.quantity,
        date: new Date().toISOString(),
      });

      // 2. Update stock
      await axios.patch(`http://localhost:3001/products/${product.id}`, {
        numberInStock: product.numberInStock - data.quantity,
      });

      onOrderComplete(orderRes.data.id);
      reset();
      setError(null);
      alert("Order processed successfully");
    } catch (err) {
      setError("Something went wrong");
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

      <div>
        <label className="text-sm font-medium">Quantity</label>
        <input
          type="number"
          {...register("quantity", {
            required: true,
            min: 1,
            valueAsNumber: true,
          })}
          className="w-full border px-3 py-2 rounded mt-1"
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
