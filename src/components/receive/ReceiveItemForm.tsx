import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import productClient from "@/services/product-client";
import receiptClient from "@/services/receipt-client";
import type { Product } from "@/types/Product";
import { CanceledError } from "axios";

type FormData = {
  itemCode: string;
  name: string;
  unit: string;
  quantity: number;
};

type Props = {
  onStockUpdate: (updatedProducts: Product[], updatedId: string) => void;
};

export function ReceiveItemForm({ onStockUpdate }: Props) {
  const { register, handleSubmit, watch, reset } = useForm<FormData>();
  const [matchedProduct, setMatchedProduct] = useState<Product | null>(null);
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

  const onSubmit = async (data: FormData) => {
    if (!data.quantity || data.quantity < 1) return;

    if (matchedProduct) {
      await productClient.patch<Product>(matchedProduct._id, {
        numberInStock:
          Number(matchedProduct.numberInStock) + Number(data.quantity),
        received: new Date().toISOString().split("T")[0],
      });
    } else {
      await productClient.create<Omit<Product, "_id">>({
        itemCode: data.itemCode,
        name: data.name,
        unit: data.unit,
        numberInStock: data.quantity,
        damaged: 0,
        received: new Date().toISOString().split("T")[0],
      });
    }

    alert("Stock received successfully");
    reset();
    setMatchedProduct(null);

    const { request } = productClient.getAll<Product>();
    const latest = await request;
    const sorted = latest.data.sort(
      (a, b) => new Date(b.received).getTime() - new Date(a.received).getTime()
    );
    const updatedId = matchedProduct ? matchedProduct._id : sorted[0]._id;
    onStockUpdate(sorted, updatedId);

    await receiptClient.create({
      itemCode: data.itemCode,
      quantity: data.quantity,
      date: new Date().toISOString(),
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white p-6 rounded shadow max-w-xl space-y-4"
    >
      <div>
        <label className="text-sm font-medium">Item Code</label>
        <input
          {...register("itemCode", { required: true })}
          className="w-full border px-3 py-2 rounded mt-1"
          placeholder="e.g. CEM-50GREY"
        />
      </div>

      {matchedProduct ? (
        <div className="bg-green-50 border p-3 rounded text-sm">
          <p>
            <strong>Item:</strong> {matchedProduct.name}
          </p>
          <p>
            <strong>Current Stock:</strong> {matchedProduct.numberInStock}{" "}
            {matchedProduct.unit}
          </p>
        </div>
      ) : (
        <>
          <div>
            <label className="text-sm font-medium">Name</label>
            <input
              {...register("name", { required: true })}
              className="w-full border px-3 py-2 rounded mt-1"
              placeholder="Product name"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Unit</label>
            <input
              {...register("unit", { required: true })}
              className="w-full border px-3 py-2 rounded mt-1"
              placeholder="e.g. pcs, bags"
            />
          </div>
        </>
      )}

      <div>
        <label className="text-sm font-medium">Quantity Received</label>
        <input
          type="number"
          {...register("quantity", {
            required: true,
            min: 1,
            valueAsNumber: true,
          })}
          className="w-full border px-3 py-2 rounded mt-1"
          placeholder="e.g. 100"
        />
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Save
      </button>
    </form>
  );
}
