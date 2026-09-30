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
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { isAxiosError } from "axios";

type Props = {
  product: Product;
};
export function DamageModal({ product }: Props) {
  const [open, setOpen] = useState(false);

  type DamageFormData = { quantity: number; notes?: string };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DamageFormData>({
    defaultValues: { quantity: 0, notes: "" },
    mode: "onChange", //  Ensures validation fires while typing
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
    } catch (err) {
      console.error("Error reporting damage:", err);
      const responseData = isAxiosError(err) ? err.response?.data : null;
      const message =
        typeof responseData === "string"
          ? responseData
          : "Something went wrong. Please try again.";

      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          disabled={product.numberInStock <= 0}
          title={
            product.numberInStock <= 0
              ? "No stock available to report as damaged"
              : undefined
          }
          className="text-sm text-red-700 hover:underline disabled:cursor-not-allowed disabled:text-gray-400 disabled:no-underline"
        >
          Report Damage
        </button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] max-w-md overflow-y-auto rounded-md bg-white p-5 shadow-lg sm:p-6">
        <DialogTitle className="text-lg font-bold">
          Report Damage: {product.name}
        </DialogTitle>

        <DialogDescription className="text-sm text-gray-500 mb-4">
          Enter the quantity and optional notes to log damaged stock.
        </DialogDescription>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div>
            <label
              htmlFor="damage-quantity"
              className="block text-sm font-medium text-gray-700"
            >
              Quantity
            </label>

            <input
              id="damage-quantity"
              type="number"
              min={1}
              step={1}
              max={product.numberInStock}
              disabled={product.numberInStock <= 0}
              {...register("quantity", {
                valueAsNumber: true,
                validate: {
                  required: (value) =>
                    Number.isFinite(value) || "Quantity is required",
                  wholeNumber: (value) =>
                    Number.isInteger(value) || "Enter a whole number",
                  positive: (value) =>
                    value >= 1 || "Quantity must be at least 1",
                  availableStock: (value) =>
                    value <= product.numberInStock ||
                    `Cannot exceed available stock of ${product.numberInStock}`,
                },
              })}
              className="w-full rounded border border-gray-300 px-2 py-2 disabled:bg-gray-100"
            />

            <small className="text-sm text-gray-500">
              Available stock: {product.numberInStock}
            </small>

            {errors.quantity && (
              <p className="text-sm text-red-600">{errors.quantity.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="damage-notes"
              className="block text-sm font-medium text-gray-700"
            >
              Notes (optional)
            </label>
            <textarea
              id="damage-notes"
              {...register("notes")}
              className="w-full rounded border border-gray-300 px-2 py-2"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || product.numberInStock <= 0}
            className="rounded-md bg-rose-700 px-4 py-2 font-medium text-white hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save damage report"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
