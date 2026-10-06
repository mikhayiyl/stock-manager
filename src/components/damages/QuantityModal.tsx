import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import getAuthUser from "@/lib/auth";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@radix-ui/react-dialog";

const quantitySchema = z.object({
  quantity: z
    .number({ required_error: "Quantity is required" })
    .min(1, "Minimum quantity is 1"),
  notes: z.string().optional(),
});

type QuantityFormValues = z.infer<typeof quantitySchema>;

export function QuantityModal({
  open,
  onClose,
  onSubmit,
  max,
  actionType,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (quantity: number, notes: string) => Promise<boolean>;
  max: number;
  actionType: "resolved" | "disposed";
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<QuantityFormValues>({
    resolver: zodResolver(quantitySchema),
    defaultValues: {
      quantity: 1,
      notes: "",
    },
  });

  const quantity = watch("quantity");

  const internalSubmit = async (data: QuantityFormValues) => {
    if (!getAuthUser()?.isAdmin)
      return toast.error("Access denied. Administrator access is required.");
    if (data.quantity > max) return;
    const succeeded = await onSubmit(data.quantity, data.notes ?? "");
    if (succeeded === false) return;
    reset();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !isSubmitting) onClose();
      }}
    >
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-50 bg-black/40" />
        <DialogContent
          onPointerDownOutside={(event) => event.preventDefault()}
          onInteractOutside={(event) => event.preventDefault()}
          className="fixed left-1/2 top-1/2 z-50 max-h-[90dvh] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto overscroll-contain rounded-md border border-gray-200 bg-white p-5 shadow-xl"
        >
          <DialogTitle className="text-lg font-semibold text-gray-900">
            {actionType === "resolved"
              ? "Resolve damaged stock"
              : "Dispose damaged stock"}
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm text-gray-600">
            {actionType === "resolved"
              ? "Resolved units will be added back to available stock."
              : "Disposed units will remain removed from available stock."}{" "}
            Maximum: {max}.
          </DialogDescription>

          <form
            onSubmit={handleSubmit(internalSubmit)}
            className="mt-5 space-y-4"
          >
            <div>
              <label
                htmlFor="damage-resolution-quantity"
                className="block text-sm font-medium text-gray-700"
              >
                Quantity
              </label>
              <input
                id="damage-resolution-quantity"
                type="number"
                {...register("quantity", { valueAsNumber: true })}
                min={1}
                max={max}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
              />
              {errors.quantity && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.quantity.message}
                </p>
              )}
              {quantity > max && (
                <p className="mt-1 text-sm text-red-600" role="alert">
                  Quantity exceeds the remaining amount ({max}).
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="damage-resolution-notes"
                className="block text-sm font-medium text-gray-700"
              >
                Notes (optional)
              </label>
              <textarea
                id="damage-resolution-notes"
                placeholder="Add a note"
                {...register("notes")}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  reset();
                  onClose();
                }}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || quantity > max}
                className="rounded-md bg-emerald-700 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting
                  ? "Saving..."
                  : actionType === "resolved"
                    ? "Confirm resolution"
                    : "Confirm disposal"}
              </button>
            </div>
          </form>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
