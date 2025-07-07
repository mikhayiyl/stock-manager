import useProducts from "@/hooks/useProducts";
import useReceipts from "@/hooks/useReceipts";
import { Link } from "react-router-dom";

type Props = {
  highlightId: string | null;
};

export default function ProductTable({ highlightId }: Props) {
  const { products, isLoading: loadingProducts } = useProducts();
  const { receipts, isLoading: loadingReceipts } = useReceipts();

  const isLoading = loadingProducts || loadingReceipts;
  const hasLoaded = !loadingProducts && !loadingReceipts;
  const isEmpty = hasLoaded && receipts.length === 0;

  if (isLoading) {
    return (
      <div className="bg-white p-4 rounded shadow overflow-x-auto">
        <h3 className="text-lg font-semibold mb-4">Recent Receipts</h3>
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              {["Item Code", "Name", "Quantity", "Stock", "Unit", "Date"].map(
                (header) => (
                  <th key={header} className="p-2">
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 6 }).map((_, rowIndex) => (
              <tr key={rowIndex} className="border-b">
                {Array.from({ length: 6 }).map((_, colIndex) => (
                  <td key={colIndex} className="p-2">
                    <div className="h-4 w-full bg-gray-200 rounded" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="bg-white p-4 rounded shadow text-center text-gray-500 py-10">
        No receipts found.
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded shadow overflow-x-auto">
      <h3 className="text-lg font-semibold mb-4">Recent Receipts</h3>
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
            const product = products.find(
              (p) => p.itemCode === receipt.itemCode
            );

            return (
              <tr
                key={receipt._id}
                className={`border-b ${
                  receipt._id === highlightId
                    ? "bg-orange-300 font-semibold"
                    : ""
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
    </div>
  );
}
