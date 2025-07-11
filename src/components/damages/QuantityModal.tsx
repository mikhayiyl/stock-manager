import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export const quantitySchema = z.object({
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
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (quantity: number, notes: string) => void;
  max: number;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
  } = useForm<QuantityFormValues>({
    resolver: zodResolver(quantitySchema),
    defaultValues: {
      quantity: 1,
      notes: "",
    },
  });

  const quantity = watch("quantity");

  const internalSubmit = (data: QuantityFormValues) => {
    if (data.quantity > max) return;
    onSubmit(data.quantity, data.notes ?? "");
    reset();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-white/30 via-white/10 to-transparent pointer-events-none">
      <div className="bg-white p-4 rounded-lg border border-gray-300 shadow-lg w-80 space-y-4 pointer-events-auto transform scale-95 animate-fadeIn">
        <h2 className="text-lg font-semibold">Set Quantity</h2>

        <form onSubmit={handleSubmit(internalSubmit)} className="space-y-4">
          <div>
            <input
              type="number"
              {...register("quantity", { valueAsNumber: true })}
              min={1}
              max={max}
              className="border px-2 py-1 rounded w-full"
            />
            {errors.quantity && (
              <p className="text-xs text-red-600 mt-1">
                {errors.quantity.message}
              </p>
            )}
            {quantity > max && (
              <p className="text-xs text-red-500 mt-1">
                Quantity exceeds available amount ({max})
              </p>
            )}
          </div>

          <textarea
            placeholder="Optional notes"
            {...register("notes")}
            className="border px-2 py-1 rounded w-full text-sm"
          />

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                reset();
                onClose();
              }}
              className="px-2 py-0.5 text-xs rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-2 py-0.5 text-xs rounded-full bg-blue-600 text-white hover:bg-blue-700"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
