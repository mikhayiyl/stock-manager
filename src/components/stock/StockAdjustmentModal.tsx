import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@radix-ui/react-dialog";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import apiClient from "@/services/api-client";
import type { Product } from "@/types/Product";

const schema = z.object({
  countedStock: z.number().int("Enter a whole number").min(0, "Stock cannot be negative"),
  reason: z
    .string()
    .trim()
    .min(3, "Give a reason for the stock count")
    .max(500, "Reason cannot exceed 500 characters"),
});

type FormData = z.infer<typeof schema>;

type Props = {
  product: Product;
};

export function StockAdjustmentModal({ product }: Props) {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { countedStock: product.numberInStock, reason: "" },
    mode: "onChange",
  });

  const countedStock = watch("countedStock");
  const difference =
    Number.isFinite(countedStock) ? countedStock - product.numberInStock : 0;

  const onSubmit = async (data: FormData) => {
    try {
      await apiClient.post("/stock-movements/adjustments", {
        productId: product._id,
        countedStock: data.countedStock,
        reason: data.reason.trim(),
      });

      toast.success("Stock count recorded and inventory updated.");
      window.dispatchEvent(new Event("products:refresh"));
      window.dispatchEvent(new Event("stock-movements:refresh"));
      reset({ countedStock: data.countedStock, reason: "" });
      setOpen(false);
    } catch (err) {
      console.error("Failed to record stock count:", err);
      const responseData = isAxiosError(err) ? err.response?.data : null;
      toast.error(
        typeof responseData === "string"
          ? responseData
          : "Could not record this stock count. Please try again.",
      );
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (isSubmitting) return;
        setOpen(nextOpen);
        if (!nextOpen) reset({ countedStock: product.numberInStock, reason: "" });
        if (nextOpen) reset({ countedStock: product.numberInStock, reason: "" });
      }}
    >
      <DialogTrigger asChild>
        <button
          type="button"
          className="rounded text-sm font-medium text-emerald-800 underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
        >
          Record count
        </button>
      </DialogTrigger>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-50 bg-black/40" />
        <DialogContent
          onPointerDownOutside={(event) => event.preventDefault()}
          onInteractOutside={(event) => event.preventDefault()}
          className="fixed left-1/2 top-1/2 z-50 max-h-[90dvh] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto overscroll-contain rounded-lg border border-gray-200 bg-white p-5 shadow-xl sm:p-6"
        >
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Record physical stock count
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm text-gray-600">
            {product.name} ({product.itemCode}). Enter the quantity counted on
            hand; inventory and its movement history will update together.
          </DialogDescription>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
            <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-sm">
              <span className="text-gray-600">Current system balance: </span>
              <strong className="text-gray-900">
                {product.numberInStock} {product.unit}
              </strong>
            </div>

            <div>
              <label
                htmlFor={`counted-stock-${product._id}`}
                className="block text-sm font-medium text-gray-700"
              >
                Physical count
              </label>
              <input
                id={`counted-stock-${product._id}`}
                type="number"
                min={0}
                step={1}
                aria-invalid={Boolean(errors.countedStock)}
                aria-describedby={
                  errors.countedStock
                    ? `counted-stock-error-${product._id}`
                    : undefined
                }
                {...register("countedStock", { valueAsNumber: true })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              {errors.countedStock && (
                <p
                  id={`counted-stock-error-${product._id}`}
                  className="mt-1 text-sm text-red-600"
                  role="alert"
                >
                  {errors.countedStock.message}
                </p>
              )}
              <p
                className={`mt-1 text-sm ${
                  difference === 0
                    ? "text-gray-600"
                    : difference > 0
                      ? "text-green-700"
                      : "text-amber-700"
                }`}
                aria-live="polite"
              >
                {difference === 0
                  ? "No difference from the system balance."
                  : `Adjustment: ${difference > 0 ? "+" : ""}${difference} ${product.unit}`}
              </p>
            </div>

            <div>
              <label
                htmlFor={`count-reason-${product._id}`}
                className="block text-sm font-medium text-gray-700"
              >
                Reason
              </label>
              <textarea
                id={`count-reason-${product._id}`}
                rows={3}
                maxLength={500}
                aria-invalid={Boolean(errors.reason)}
                aria-describedby={
                  errors.reason ? `count-reason-error-${product._id}` : undefined
                }
                {...register("reason")}
                placeholder="e.g. Monthly physical inventory count"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              {errors.reason && (
                <p
                  id={`count-reason-error-${product._id}`}
                  className="mt-1 text-sm text-red-600"
                  role="alert"
                >
                  {errors.reason.message}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  reset({ countedStock: product.numberInStock, reason: "" });
                  setOpen(false);
                }}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !difference || !watch("reason")?.trim()}
                className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "Recording..." : "Record adjustment"}
              </button>
            </div>
          </form>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
