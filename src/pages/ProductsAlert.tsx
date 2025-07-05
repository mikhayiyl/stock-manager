import { useState } from "react";
import { saveAs } from "file-saver";
import pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import useProducts from "@/hooks/useProducts";
import useDamages from "@/hooks/useDamages";
import useOrders from "@/hooks/useOrders";
import { useLowStockAnalysis } from "@/hooks/useLowStockAnalysis";
import type { Entry } from "@/components/reports/StockCard";
import { ProductExceptionCard } from "@/components/productExceptions/ProductExceptionCard";
pdfMake.vfs = pdfFonts.vfs;

const FILTERS = ["Damaged", "Low Stock", "Out of Stock"] as const;
type FilterType = (typeof FILTERS)[number];

export function ProductExceptionsReport() {
  const { products } = useProducts();
  const { damages } = useDamages();
  const { orders } = useOrders();
  const { isLowStock, getRequiredStock } = useLowStockAnalysis(orders);

  const [selectedFilters, setSelectedFilters] = useState<FilterType[]>([
    "Damaged",
  ]);
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const toggleFilter = (filter: FilterType) => {
    setCurrentPage(1);
    setSelectedFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter]
    );
  };

  const isInRange = (dateStr: string) => {
    const entryTime = new Date(dateStr).getTime();
    const fromTime = dateRange.from
      ? new Date(dateRange.from + "T00:00:00").getTime()
      : -Infinity;
    const toTime = dateRange.to
      ? new Date(dateRange.to + "T23:59:59").getTime()
      : Infinity;
    return entryTime >= fromTime && entryTime <= toTime;
  };

  const damagedMap = new Map<string, Entry[]>();
  if (selectedFilters.includes("Damaged")) {
    damages.forEach((d) => {
      if (!isInRange(d.date)) return;
      if (!damagedMap.has(d.itemCode)) damagedMap.set(d.itemCode, []);
      damagedMap.get(d.itemCode)!.push(d);
    });
  }

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.itemCode.toLowerCase().includes(search.toLowerCase()) ||
      p.name.toLowerCase().includes(search.toLowerCase());

    const isDamaged =
      selectedFilters.includes("Damaged") && damagedMap.has(p.itemCode);
    const isLow = selectedFilters.includes("Low Stock") && isLowStock(p);
    const isOut =
      selectedFilters.includes("Out of Stock") && p.numberInStock === 0;

    return matchesSearch && (isDamaged || isLow || isOut);
  });

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  //exports
  const handleExportCSV = () => {
    const rows: string[] = [
      "Item Code,Name,Status,Remaining Stock,Damage Date,Quantity,Note",
    ];
    filteredProducts.forEach((p) => {
      const damages = selectedFilters.includes("Damaged")
        ? damagedMap.get(p.itemCode) ?? []
        : [];
      const status = [
        p.numberInStock === 0 ? "Out of Stock" : "",
        p.numberInStock > 0 && p.numberInStock <= 10 ? "Low Stock" : "",
        damages.length > 0 ? "Damaged" : "",
      ]
        .filter(Boolean)
        .join(", ");
      const stockDisplay =
        status.includes("Low Stock") || status.includes("Out of Stock")
          ? p.numberInStock
          : "—";
      if (damages.length === 0) {
        rows.push(`${p.itemCode},${p.name},${status},${stockDisplay},—,—,—`);
      } else {
        damages.forEach((d) => {
          rows.push(
            `${p.itemCode},${p.name},${status},${stockDisplay},${new Date(
              d.date
            ).toLocaleDateString()},${d.quantity},"${(d as any).note ?? "—"}"`
          );
        });
      }
      rows.push(""); //line break
    });

    const blob = new Blob([rows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    saveAs(blob, `exceptions_report_${Date.now()}.csv`);
  };

  const handleExportPDF = () => {
    const rows: any[] = [
      [
        "Item Code",
        "Name",
        "Status",
        "Remaining Stock",
        "Damage Date",
        "Quantity",
        "Note",
      ],
    ];
    filteredProducts.forEach((p) => {
      const damages = selectedFilters.includes("Damaged")
        ? damagedMap.get(p.itemCode) ?? []
        : [];
      const status = [
        p.numberInStock === 0 ? "Out of Stock" : "",
        p.numberInStock > 0 && p.numberInStock <= 10 ? "Low Stock" : "",
        damages.length > 0 ? "Damaged" : "",
      ]
        .filter(Boolean)
        .join(", ");
      const stockDisplay =
        status.includes("Low Stock") || status.includes("Out of Stock")
          ? p.numberInStock
          : "—";
      if (damages.length === 0) {
        rows.push([p.itemCode, p.name, status, stockDisplay, "—", "—", "—"]);
      } else {
        damages.forEach((d) => {
          rows.push([
            p.itemCode,
            p.name,
            status,
            stockDisplay,
            new Date(d.date).toLocaleDateString(),
            d.quantity,
            (d as any).note ?? "—",
          ]);
        });
      }
      rows.push(["", "", "", "", "", "", ""]);
    });
    const docDefinition = {
      content: [
        { text: "Product Exceptions Report", style: "header" },
        {
          table: {
            headerRows: 1,
            widths: ["auto", "*", "auto", "auto", "auto", "auto", "*"],
            body: rows,
          },
          layout: "lightHorizontalLines",
        },
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10] as [number, number, number, number],
        },
      },
    };
    pdfMake
      .createPdf(docDefinition)
      .download(`exceptions_report_${Date.now()}.pdf`);
  };

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        {FILTERS.map((filter) => (
          <label key={filter} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedFilters.includes(filter)}
              onChange={() => toggleFilter(filter)}
            />
            {filter}
          </label>
        ))}

        <input
          type="date"
          value={dateRange.from}
          onChange={(e) => {
            setCurrentPage(1);
            setDateRange((prev) => ({ ...prev, from: e.target.value }));
          }}
          className="border px-2 py-1 rounded"
        />
        <span>to</span>
        <input
          type="date"
          value={dateRange.to}
          onChange={(e) => {
            setCurrentPage(1);
            setDateRange((prev) => ({ ...prev, to: e.target.value }));
          }}
          className="border px-2 py-1 rounded"
        />

        <input
          type="text"
          placeholder="Search by name or code"
          value={search}
          onChange={(e) => {
            setCurrentPage(1);
            setSearch(e.target.value);
          }}
          className="border px-2 py-1 rounded w-64"
        />
      </div>

      {/* exports buttons */}

      <div className="flex gap-4">
        <button
          onClick={handleExportCSV}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Export CSV
        </button>
        <button
          onClick={handleExportPDF}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Export PDF
        </button>
      </div>

      {/* Product Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {paginatedProducts.map((p) => {
          const requiredStock = getRequiredStock(p);

          const severity =
            p.numberInStock === 0
              ? "Critical"
              : p.numberInStock <= requiredStock / 2
              ? "Warning"
              : p.numberInStock <= requiredStock
              ? "Low"
              : undefined;

          const status = [
            p.numberInStock === 0 ? "Out of Stock" : "",
            p.numberInStock > 0 && p.numberInStock <= requiredStock
              ? "Low Stock"
              : "",
            damagedMap.has(p.itemCode) ? "Damaged" : "",
          ].filter(Boolean);

          return (
            <ProductExceptionCard
              key={p.itemCode}
              product={p}
              damages={
                selectedFilters.includes("Damaged")
                  ? damagedMap.get(p.itemCode) ?? []
                  : []
              }
              status={status}
              severity={
                selectedFilters.includes("Low Stock") ? severity : undefined
              }
            />
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
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
