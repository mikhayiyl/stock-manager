import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@radix-ui/react-dialog";
import { useState } from "react";
import axios from "axios";
import type { Product } from "@/types/Product";

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
    return console.log(2);

    try {
      // 1. Log the damage entry
      await axios.post("http://localhost:3001/damages", {
        productId: product.id,
        itemCode: product.itemCode,
        quantity,
        notes,
        date: new Date().toISOString(),
      });

      // 2. Update product's damage count
      const res = await axios.put(
        `http://localhost:3001/products/${product.id}`,
        {
          damaged: product.damaged + quantity,
        }
      );

      return console.log(res);

      // Optional: refresh product list or show toast
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

        <h3 className="text-lg font-bold mb-4">Damage: {product.name}</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Quantity
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
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
