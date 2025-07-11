import productClient from "@/services/product-client";
import receiptClient from "@/services/receipt-client";
import type { Product } from "@/types/Product";
import { CanceledError } from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type FormData = {
  itemCode: string;
  name: string;
  unit: string;
  quantity: number;
  isExpress: boolean;
  client: string;
  deliveryNote: string;
};

type Props = {
  onStockUpdate: (updatedId: string) => void;
};

export function ReceiveItemForm({ onStockUpdate }: Props) {
  const { register, handleSubmit, watch, reset } = useForm<FormData>({
    defaultValues: {
      isExpress: false,
      client: "",
      deliveryNote: "",
    },
  });

  const [matchedProduct, setMatchedProduct] = useState<Product | null>(null);
  const itemCode = watch("itemCode");
  const isExpress = watch("isExpress");

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
    const token = localStorage.getItem("x-auth-token");
    if (!token) return toast.error("Access denied");

    if (!data.quantity || data.quantity < 1) return;

    try {
      const today = new Date().toISOString();

      const payload = {
        itemCode: data.itemCode,
        quantity: data.quantity,
        date: today,
        isExpress: data.isExpress,
        client: data.isExpress ? data.client : null,
        deliveryNote: data.isExpress ? data.deliveryNote : null,
        name: matchedProduct?.name ?? data.name,
        unit: matchedProduct?.unit ?? data.unit,
      };

      const receipt = await receiptClient.create(payload);

      toast.success("Receipt logged successfully");
      reset();
      setMatchedProduct(null);

      window.dispatchEvent(new Event("receipts:refresh"));
      if (!data.isExpress) window.dispatchEvent(new Event("products:refresh"));

      // If backend sends updatedId, pass it on
      if (receipt?.data?._id) {
        onStockUpdate(receipt.data._id);
      }
    } catch (err) {
      console.error("Receipt failed:", err);
      toast.error("Failed to log receipt");
    }
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

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          {...register("isExpress")}
          className="accent-blue-600"
        />
        <label className="text-sm font-medium">
          Express Delivery (skip stock)
        </label>
      </div>

      {isExpress && (
        <>
          <div>
            <label className="text-sm font-medium">Client Name</label>
            <input
              {...register("client", { required: true })}
              className="w-full border px-3 py-2 rounded mt-1"
              placeholder="e.g. Ali & Sons Paints"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Delivery Note</label>
            <input
              {...register("deliveryNote", { required: false })}
              className="w-full border px-3 py-2 rounded mt-1"
              placeholder="e.g. DN-0423"
            />
          </div>
        </>
      )}

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Save
      </button>
    </form>
  );
}
