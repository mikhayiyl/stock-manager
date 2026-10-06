import { Link } from "react-router-dom";
import type { Product } from "@/types/Product";
import type { Receipt } from "@/types/Receipt";

type Props = {
  receipts: Receipt[];
  products: Product[];
  highlightId: string | null;
};

export function DataTable({ receipts, products, highlightId }: Props) {
  const productsByCode = new Map(
    products.map((product) => [product.itemCode, product]),
  );

  return (
    <table className="w-full min-w-[640px] text-sm">
      <thead className="bg-emerald-50/70 text-left text-slate-700">
        <tr>
          <th className="p-2">Item Code</th>
          <th className="p-2">Name</th>
          <th className="p-2">Quantity</th>
          <th className="p-2">Current stock</th>
          <th className="p-2">Unit</th>
          <th className="p-2">Date</th>
        </tr>
      </thead>

      <tbody>
        {receipts.map((receipt) => {
          const product = productsByCode.get(receipt.itemCode);

          return (
            <tr
              key={receipt._id}
              className={`border-b ${
                receipt._id === highlightId ? "bg-orange-300 font-semibold" : ""
              }`}
            >
              <td className="p-2 font-medium text-emerald-800 underline-offset-2 hover:underline">
                <Link to={`/product/${receipt.itemCode}`}>
                  {receipt.itemCode}
                </Link>
              </td>
              <td className="p-2">{product?.name ?? "—"}</td>
              <td className="p-2 tabular-nums">
                {receipt.quantity.toLocaleString()}
              </td>
              <td className="p-2 tabular-nums">
                {product?.numberInStock.toLocaleString() ?? "—"}
              </td>
              <td className="p-2">{product?.unit ?? "—"}</td>
              <td className="p-2">
                {new Date(receipt.date).toLocaleString("en-GB", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
