import { Link } from "react-router-dom";
import type { Product } from "@/types/Product";
import type { Receipt } from "@/types/Receipt";

type Props = {
  receipts: Receipt[];
  products: Product[];
  highlightId: string | null;
};

export function DataTable({ receipts, products, highlightId }: Props) {
  return (
    <table className="min-w-full text-sm">
      <thead className="bg-gray-100 text-left">
        <tr>
          <th className="p-2">Item Code</th>
          <th className="p-2">Name</th>
          <th className="p-2">Quantity</th>
          <th className="p-2">Stock</th>
          <th className="p-2">Unit</th>
          <th className="p-2">Date</th>
        </tr>
      </thead>

      <tbody>
        {receipts.map((receipt) => {
          const product = products.find((p) => p.itemCode === receipt.itemCode);

          return (
            <tr
              key={receipt._id}
              className={`border-b ${
                receipt._id === highlightId ? "bg-orange-300 font-semibold" : ""
              }`}
            >
              <td className="p-2 text-blue-600 underline">
                <Link to={`/product/${receipt.itemCode}`}>
                  {receipt.itemCode}
                </Link>
              </td>
              <td className="p-2">{product?.name ?? "—"}</td>
              <td className="p-2">{receipt.quantity}</td>
              <td className="p-2">{product?.numberInStock ?? "—"}</td>
              <td className="p-2">{product?.unit ?? "—"}</td>
              <td className="p-2">
                {new Date(receipt.date).toLocaleDateString()}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
