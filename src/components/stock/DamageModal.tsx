import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import damageClient from "@/services/damage-client";
import type { Product } from "@/types/Product";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@radix-ui/react-dialog";
import { useState } from "react";
import { toast } from "sonner";

const damageSchema = z.object({
  quantity: z
    .number({ invalid_type_error: "Quantity is required" })
    .min(1, "Quantity must be at least 1"),
  notes: z.string().optional(),
});

type DamageFormData = z.infer<typeof damageSchema>;

type Props = {
  product: Product;
};

export function DamageModal({ product }: Props) {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DamageFormData>({
    resolver: zodResolver(damageSchema),
    defaultValues: { quantity: 0, notes: "" },
  });

  const onSubmit = async (data: DamageFormData) => {
    try {
      await damageClient.create({
        productId: product._id,
        itemCode: product.itemCode,
        quantity: data.quantity,
        notes: data.notes,
        date: new Date().toISOString(),
      });

      reset();
      setOpen(false);
      toast.success("Damage reported successfully");
      window.dispatchEvent(new Event("products:refresh"));
    } catch (err: any) {
      console.error("Error reporting damage:", err);

      const message =
        err?.response?.data?.message || // custom message from server
        err?.response?.data || // fallback to raw response
        err?.message || // generic JS error message
        "Something went wrong. Please try again.";

      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-red-600 hover:underline text-sm">
          Report Damage
        </button>
      </DialogTrigger>

      <DialogContent className="bg-white p-6 rounded shadow w-[400px]">
        <DialogTitle className="text-lg font-bold">
          Report Damage: {product.name}
        </DialogTitle>

        <DialogDescription className="text-sm text-gray-500 mb-4">
          Enter the quantity and optional notes to log damaged stock.
        </DialogDescription>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Quantity
            </label>
            <input
              type="number"
              {...register("quantity", { valueAsNumber: true })}
              className="border px-2 py-1 w-full rounded"
            />
            {errors.quantity && (
              <p className="text-sm text-red-600">{errors.quantity.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Notes (optional)
            </label>
            <textarea
              {...register("notes")}
              className="border px-2 py-1 w-full rounded"
            />
          </div>

          <button
            type="submit"
            className="bg-rose-500 text-white px-4 py-2 rounded hover:bg-rose-600"
          >
            Save
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
