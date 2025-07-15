import { useState } from "react";
import { saveAs } from "file-saver";
import pdfMake from "pdfmake/build/pdfmake";
import type { TDocumentDefinitions } from "pdfmake/interfaces";

import * as pdfFonts from "pdfmake/build/vfs_fonts";
import useProducts from "@/hooks/useProducts";
import useOrders from "@/hooks/useOrders";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Link } from "react-router-dom";
import Pagination from "@/components/PaginationBar";
pdfMake.vfs = pdfFonts.vfs;
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip);

export function SalesTrendReport() {
  const { products } = useProducts();
  const { orders } = useOrders();

  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  const orderMap = new Map<string, number>();
  orders.forEach((o) => {
    if (!isInRange(o.date)) return;
    orderMap.set(o.itemCode, (orderMap.get(o.itemCode) ?? 0) + o.quantity);
  });

  const rankedProducts = products
    .map((p) => ({
      ...p,
      totalOrdered: orderMap.get(p.itemCode) ?? 0,
    }))
    .sort((a, b) => b.totalOrdered - a.totalOrdered);

  const paginated = rankedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleExportCSV = () => {
    const rows = ["Item Code,Name,Total Ordered"];
    rankedProducts.forEach((p) => {
      rows.push(`${p.itemCode},${p.name},${p.totalOrdered}`);
    });
    const blob = new Blob([rows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    saveAs(blob, `sales_trend_${Date.now()}.csv`);
  };

  const handleExportPDF = () => {
    const rows = [["Item Code", "Name", "Total Ordered"]];
    rankedProducts.forEach((p) => {
      rows.push([p.itemCode, p.name, String(p.totalOrdered)]);
    });

    const docDefinition: TDocumentDefinitions = {
      content: [
        { text: "Sales Trend Report", style: "header" },
        {
          table: {
            headerRows: 1,
            widths: ["auto", "*", "auto"],
            body: rows,
          },
          layout: "lightHorizontalLines",
        },
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10], // ✅ Valid 4-tuple
        },
      },
    };

    pdfMake.createPdf(docDefinition).download(`sales_trend_${Date.now()}.pdf`);
  };

  const chartData = {
    labels: rankedProducts.slice(0, 10).map((p) => p.name),
    datasets: [
      {
        label: "Total Ordered",
        data: rankedProducts.slice(0, 10).map((p) => p.totalOrdered),
        backgroundColor: "#3b82f6",
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <input
          type="date"
          value={dateRange.from}
          onChange={(e) => {
            setCurrentPage(1);
            setDateRange((prev) => ({ ...prev, from: e.target.value }));
          }}
          className="border px-3 py-1 rounded bg-white text-black dark:bg-gray-800 dark:text-white"
        />
        <span>to</span>
        <input
          type="date"
          value={dateRange.to}
          onChange={(e) => {
            setCurrentPage(1);
            setDateRange((prev) => ({ ...prev, to: e.target.value }));
          }}
          className="border px-3 py-1 rounded bg-white text-black dark:bg-gray-800 dark:text-white"
        />
      </div>
      {/* Chart */}
      <div className="bg-white p-4 rounded shadow-sm">
        <h3 className="font-semibold mb-2">Top 10 Fast-Moving Products</h3>
        <Bar
          data={chartData}
          options={{
            responsive: true,
            plugins: { legend: { display: false } },
          }}
        />
      </div>
      {/* Export Buttons */}
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
      {/* Ranked List */}
      <div className="bg-white p-4 rounded shadow-sm">
        <h3 className="font-semibold mb-2">All Products by Order Volume</h3>
        <table className="w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">#</th>
              <th className="p-2 border">Item Code</th>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Total Ordered</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((p, i) => (
              <tr key={p.itemCode}>
                <td className="p-2 border">
                  {(currentPage - 1) * itemsPerPage + i + 1}
                </td>
                <td className="p-2 border text-blue-600 underline">
                  <Link to={`/product/${p.itemCode}`}>{p.itemCode}</Link>
                </td>
                <td className="p-2 border text-blue-600 underline">
                  <Link to={`/product/${p.itemCode}`}>{p.name}</Link>
                </td>
                <td className="p-2 border">{p.totalOrdered}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <Pagination
        totalItems={rankedProducts.length}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />{" "}
    </div>
  );
}
