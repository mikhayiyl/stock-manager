import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import axios from "axios";
import type { Product } from "@/types/Product";

type FormData = {
  itemCode: string;
  name?: string;
  unit?: string;
  quantity: number;
};

type Props = {
  onStockUpdate: (updatedProducts: Product[], updatedId: number) => void;
};

export function ReceiveItemForm({ onStockUpdate }: Props) {
  const { register, handleSubmit, watch, reset } = useForm<FormData>();
  const [matchedProduct, setMatchedProduct] = useState<Product | null>(null);
  const itemCode = watch("itemCode");

  useEffect(() => {
    if (itemCode?.trim().length > 0) {
      axios
        .get(`http://localhost:3001/products?itemCode=${itemCode}`)
        .then((res) => {
          setMatchedProduct(res.data[0] ?? null);
        })
        .catch(() => setMatchedProduct(null));
    }
  }, [itemCode]);

  const onSubmit = async (data: FormData) => {
    if (!data.quantity || data.quantity < 1) return;

    if (matchedProduct) {
      await axios.patch(`http://localhost:3001/products/${matchedProduct.id}`, {
        numberInStock:
          Number(matchedProduct.numberInStock) + Number(data.quantity),
        received: new Date().toISOString().split("T")[0],
      });
    } else {
      await axios.post("http://localhost:3001/products", {
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

    const res = await axios.get("http://localhost:3001/products");
    const sorted = res.data.sort(
      (a: Product, b: Product) =>
        new Date(b.received).getTime() - new Date(a.received).getTime()
    );
    onStockUpdate(sorted, matchedProduct ? matchedProduct.id : sorted[0].id);
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
