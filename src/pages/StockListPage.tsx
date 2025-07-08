import { DamageModal } from "@/components/stock/DamageModal";
import useProducts from "@/hooks/useProducts";
import getAuthUser from "@/lib/auth";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function StockListPage() {
  const { products: allProducts } = useProducts();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filtered = allProducts.filter((p) =>
    `${p.itemCode} ${p.name}`.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const isAdmin = getAuthUser()?.isAdmin;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Stock List</h2>

      <input
        type="text"
        placeholder="Search by item code or name..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setCurrentPage(1);
        }}
        className="w-full max-w-md border px-4 py-2 rounded shadow-sm"
      />

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
                  <Link to={`/product/${product.itemCode}`}>
                    {product.name}
                  </Link>
                </td>
                <td className="p-3">{product.numberInStock}</td>
                <td className="p-3">{product.damaged}</td>
                <td className="p-3">{product.unit}</td>
                <td className="p-3">{product.received}</td>
                <td className="p-3">
                  {isAdmin && <DamageModal product={product} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <p className="p-4 text-center text-gray-500">No products found.</p>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => handlePageChange(i + 1)}
              className={`px-3 py-1 border rounded ${
                currentPage === i + 1 ? "bg-blue-600 text-white" : ""
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
