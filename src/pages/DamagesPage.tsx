import useDamages from "@/hooks/useDamages";
import { format } from "date-fns";
import { useState } from "react";
import useProducts from "@/hooks/useProducts";
import apiClient from "@/services/api-client";

export default function DamagePage() {
  const { damages } = useDamages();
  const { products } = useProducts();

  console.log(damages);

  const [filters, setFilters] = useState({
    itemCode: "",
    name: "",
    startDate: "",
    endDate: "",
  });

  const filteredDamages = damages.filter((d) => {
    const matchingProduct = products.find(
      (p) => p.itemCode.toLowerCase() === d.itemCode.toLowerCase()
    );

    const matchesItemCode = filters.itemCode
      ? d.itemCode.toLowerCase().includes(filters.itemCode.toLowerCase())
      : true;

    const matchesName = filters.name
      ? matchingProduct?.name
          ?.toLowerCase()
          .includes(filters.name.toLowerCase())
      : true;

    const damageDate = new Date(d.date);
    const matchesStartDate = filters.startDate
      ? damageDate >= new Date(filters.startDate)
      : true;

    const matchesEndDate = filters.endDate
      ? damageDate <= new Date(filters.endDate + "T23:59:59")
      : true;

    return matchesItemCode && matchesName && matchesStartDate && matchesEndDate;
  });

  const handleResolve = async (
    id: string,
    status: "replaced" | "resold" | "disposed"
  ) => {
    try {
      await apiClient.patch(`/damages/resolve/${id}`, { status });
      window.dispatchEvent(new Event("products:refresh")); // optional
    } catch (err) {
      console.error("Failed to resolve damage:", err);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Damage Reports</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <input
          placeholder="Item Code"
          value={filters.itemCode}
          onChange={(e) => setFilters({ ...filters, itemCode: e.target.value })}
          className="border px-2 py-1 rounded"
        />
        <input
          placeholder="Product Name"
          value={filters.name}
          onChange={(e) => setFilters({ ...filters, name: e.target.value })}
          className="border px-2 py-1 rounded"
        />
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) =>
            setFilters({ ...filters, startDate: e.target.value })
          }
          className="border px-2 py-1 rounded"
        />
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          className="border px-2 py-1 rounded"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border mt-4 text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2">Item Code</th>
              <th className="p-2">Product Name</th>
              <th className="p-2">Quantity</th>
              <th className="p-2">Date</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDamages.map((d) => {
              const matchingProduct = products.find(
                (p) => p.itemCode === d.itemCode
              );

              return (
                <tr key={d._id} className="border-t">
                  <td className="p-2">{d.itemCode}</td>
                  <td className="p-2">{matchingProduct?.name ?? "—"}</td>
                  <td className="p-2">{d.quantity}</td>
                  <td className="p-2">
                    {format(new Date(d.date), "yyyy-MM-dd")}
                  </td>
                  <td className="p-2 capitalize">{d.status}</td>
                  <td className="p-2 space-x-2">
                    {d.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleResolve(d._id, "replaced")}
                          className="text-blue-600 hover:underline"
                        >
                          Mark Replaced
                        </button>
                        <button
                          onClick={() => handleResolve(d._id, "resold")}
                          className="text-green-600 hover:underline"
                        >
                          Mark Resold
                        </button>
                        <button
                          onClick={() => handleResolve(d._id, "disposed")}
                          className="text-red-600 hover:underline"
                        >
                          Mark Disposed
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
