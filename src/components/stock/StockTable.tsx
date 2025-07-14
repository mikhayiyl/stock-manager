import { Link } from "react-router-dom";
import { DamageModal } from "@/components/stock/DamageModal";
import getAuthUser from "@/lib/auth";
import { EmptyState } from "@/components/EmptyState";
import { SkeletonBlock } from "../SkeletonBlock";
import { useDebounce } from "@/hooks/useDebounce";

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
  const debouncedSearch = useDebounce(search, 400);

  const filtered = products.filter((p) =>
    `${p.itemCode} ${p.name}`
      .toLowerCase()
      .includes(debouncedSearch.toLowerCase())
  );

  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const isAdmin = getAuthUser()?.isAdmin;

  if (isLoading) {
    return <SkeletonBlock rows={10} columns={7} variant="card" />;
  }

  if (filtered.length === 0) {
    return <EmptyState message="No products found." />;
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
