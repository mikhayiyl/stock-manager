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

type Props = {
  product: Product;
};

export function DamageModal({ product }: Props) {
  const [quantity, setQuantity] = useState(0);
  const [notes, setNotes] = useState("");
  const [open, setOpen] = useState(false);

  const handleSubmit = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    if (!quantity || quantity <= 0) return;

    try {
      await damageClient.create({
        productId: product._id,
        itemCode: product.itemCode,
        quantity,
        notes,
        date: new Date().toISOString(),
      });

      window.dispatchEvent(new Event("products:refresh"));
      setOpen(false);
      setQuantity(0);
      setNotes("");
    } catch (err) {
      console.error("Error reporting damage:", err);
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

        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Quantity
            </label>

            <input
              type="number"
              value={quantity || ""}
              onChange={(e) =>
                setQuantity(
                  e.target.value === "" ? 0 : parseInt(e.target.value)
                )
              }
              className="border px-2 py-1 w-full rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="border px-2 py-1 w-full rounded"
            />
          </div>

          <button
            onClick={handleSubmit}
            className="bg-rose-500 text-white px-4 py-2 rounded hover:bg-rose-600"
          >
            Save
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
