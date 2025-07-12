import { Link } from "react-router-dom";
import { DamageModal } from "@/components/stock/DamageModal";
import getAuthUser from "@/lib/auth";

type Product = {
  _id: string;
  itemCode: string;
  name: string;
  numberInStock: number;
  damaged: number;
  unit: string;
  received: string;
};

type Props = {
  products: Product[];
  search: string;
  isLoading: boolean;
  currentPage: number;
  itemsPerPage: number;
};

export default function StockTable({
  products,
  search,
  isLoading,
  currentPage,
  itemsPerPage,
}: Props) {
  const filtered = products.filter((p) =>
    `${p.itemCode} ${p.name}`.toLowerCase().includes(search.toLowerCase())
  );

  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const isAdmin = getAuthUser()?.isAdmin;

  if (isLoading) {
    return (
      <div className="bg-white rounded shadow p-4 space-y-2 animate-pulse">
        <div className="h-6 w-1/3 bg-gray-200 rounded" />
        {Array.from({ length: itemsPerPage }).map((_, i) => (
          <div key={i} className="grid grid-cols-6 gap-4">
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="bg-white rounded shadow p-4 text-sm text-center text-gray-500">
        No products found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded shadow">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100 border-b text-left">
          <tr>
            <th className="p-3">Item Code</th>
            <th className="p-3">Name</th>
            <th className="p-3">In Stock</th>
            <th className="p-3">Damaged</th>
            <th className="p-3">Unit</th>
            <th className="p-3">Last Received</th>
            {isAdmin && <th className="p-3">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {paginated.map((product) => (
            <tr
              key={product._id}
              className={
                product.numberInStock === 0
                  ? "bg-red-50 text-gray-600"
                  : "border-b"
              }
            >
              <td className="p-3 text-blue-600 underline">
                <Link to={`/product/${product.itemCode}`}>
                  {product.itemCode}
                </Link>
              </td>
              <td className="p-3 text-blue-600 underline">
                <Link to={`/product/${product.itemCode}`}>{product.name}</Link>
              </td>
              <td className="p-3">{product.numberInStock}</td>
              <td className="p-3">{product.damaged}</td>
              <td className="p-3">{product.unit}</td>
              <td className="p-3">
                {new Date(product.received).toLocaleString("en-GB", {
                  dateStyle: "medium",
                  timeStyle: "short",
                  hour12: true,
                })}
              </td>
              {isAdmin && (
                <td className="p-3">
                  <DamageModal product={product} />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
