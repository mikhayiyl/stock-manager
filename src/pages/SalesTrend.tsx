import { useState } from "react";
import { saveAs } from "file-saver";
import pdfMake from "pdfmake/build/pdfmake";
import type { TDocumentDefinitions } from "pdfmake/interfaces";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { Bar } from "react-chartjs-2";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Link } from "react-router-dom";
import Pagination from "@/components/PaginationBar";
import { EmptyState } from "@/components/EmptyState";
import { SkeletonBlock } from "@/components/SkeletonBlock";
import useOrders from "@/hooks/useOrders";
import useProducts from "@/hooks/useProducts";

pdfMake.vfs = pdfFonts.vfs;
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip);

const csvCell = (value: string | number) => {
  const text = String(value);
  const safeText = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${safeText.replace(/"/g, '""')}"`;
};

export function SalesTrendReport() {
  const { products, isLoading: productsLoading } = useProducts();
  const { orders, isLoading: ordersLoading } = useOrders();
  const isLoading = productsLoading || ordersLoading;
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const invalidDateRange =
    Boolean(dateRange.from && dateRange.to) && dateRange.from > dateRange.to;

  const isInRange = (dateString: string) => {
    const orderTime = new Date(dateString).getTime();
    if (!Number.isFinite(orderTime)) return false;

    const fromTime = dateRange.from
      ? new Date(`${dateRange.from}T00:00:00`).getTime()
      : -Infinity;
    const toTime = dateRange.to
      ? new Date(`${dateRange.to}T23:59:59.999`).getTime()
      : Infinity;

    return orderTime >= fromTime && orderTime <= toTime;
  };

  const ordersInRange = invalidDateRange
    ? []
    : orders.filter((order) => isInRange(order.date));
  const unitsByItemCode = new Map<string, number>();
  ordersInRange.forEach((order) => {
    unitsByItemCode.set(
      order.itemCode,
      (unitsByItemCode.get(order.itemCode) ?? 0) + order.quantity,
    );
  });

  const rankedProducts = products
    .map((product) => ({
      ...product,
      totalOrdered: unitsByItemCode.get(product.itemCode) ?? 0,
    }))
    .sort(
      (left, right) =>
        right.totalOrdered - left.totalOrdered ||
        left.name.localeCompare(right.name),
    );
  const chartProducts = rankedProducts
    .filter((product) => product.totalOrdered > 0)
    .slice(0, 10);
  const paginatedProducts = rankedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const chartData = {
    labels: chartProducts.map((product) => product.itemCode),
    datasets: [
      {
        label: "Units ordered",
        data: chartProducts.map((product) => product.totalOrdered),
        backgroundColor: "#0f766e",
        borderRadius: 3,
        barPercentage: 0.72,
      },
    ],
  };

  const handleExportCSV = () => {
    const rows = [
      ["Item Code", "Name", "Total Units Ordered"],
      ...rankedProducts.map((product) => [
        product.itemCode,
        product.name,
        String(product.totalOrdered),
      ]),
    ].map((row) => row.map(csvCell).join(","));

    const blob = new Blob([`\uFEFF${rows.join("\r\n")}`], {
      type: "text/csv;charset=utf-8;",
    });
    saveAs(blob, `sales_by_product_${Date.now()}.csv`);
  };

  const handleExportPDF = () => {
    const rows: string[][] = [
      ["Item Code", "Name", "Total Units Ordered"],
      ...rankedProducts.map((product) => [
        product.itemCode,
        product.name,
        String(product.totalOrdered),
      ]),
    ];

    const docDefinition: TDocumentDefinitions = {
      content: [
        { text: "Sales by Product", style: "header" },
        {
          text: `Date range: ${dateRange.from || "All dates"} to ${dateRange.to || "All dates"}`,
          margin: [0, 0, 0, 10],
        },
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
          margin: [0, 0, 0, 10],
        },
      },
    };

    pdfMake
      .createPdf(docDefinition)
      .download(`sales_by_product_${Date.now()}.pdf`);
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y" as const,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: { parsed: { x: number } }) =>
            `${context.parsed.x.toLocaleString()} units ordered`,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { precision: 0 },
        title: { display: true, text: "Units ordered" },
      },
      y: {
        reverse: true,
        grid: { display: false },
        ticks: { autoSkip: false },
      },
    },
  };

  return (
    <div className="min-w-0 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Sales by product</h2>

      <section className="flex flex-wrap items-end gap-3 rounded-md border border-gray-200 bg-white p-4">
        <div>
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor="sales-from-date"
          >
            From
          </label>
          <input
            id="sales-from-date"
            type="date"
            max={dateRange.to || undefined}
            value={dateRange.from}
            onChange={(event) => {
              setCurrentPage(1);
              setDateRange((previous) => ({
                ...previous,
                from: event.target.value,
              }));
            }}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 sm:w-auto"
          />
        </div>
        <div>
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor="sales-to-date"
          >
            To
          </label>
          <input
            id="sales-to-date"
            type="date"
            min={dateRange.from || undefined}
            value={dateRange.to}
            onChange={(event) => {
              setCurrentPage(1);
              setDateRange((previous) => ({
                ...previous,
                to: event.target.value,
              }));
            }}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 sm:w-auto"
          />
        </div>
        <button
          type="button"
          disabled={!dateRange.from && !dateRange.to}
          onClick={() => {
            setDateRange({ from: "", to: "" });
            setCurrentPage(1);
          }}
          className="rounded-md px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:text-gray-400"
        >
          Clear dates
        </button>
        {invalidDateRange && (
          <p className="w-full text-sm text-red-700" role="alert">
            The start date must be on or before the end date.
          </p>
        )}
      </section>

      {isLoading ? (
        <SkeletonBlock variant="card" rows={1} title="Loading sales data..." />
      ) : invalidDateRange ? null : chartProducts.length === 0 ? (
        <EmptyState message="No product orders were placed in this date range." />
      ) : (
        <section className="mx-auto w-full max-w-5xl rounded-md border border-gray-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-base font-semibold text-gray-900">
            Top 10 products by units ordered
          </h3>
          <div className="h-[320px] w-full sm:h-[380px]">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </section>
      )}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleExportCSV}
          disabled={isLoading || invalidDateRange || products.length === 0}
          className="rounded-md bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Export CSV
        </button>
        <button
          type="button"
          onClick={handleExportPDF}
          disabled={isLoading || invalidDateRange || products.length === 0}
          className="rounded-md bg-green-700 px-4 py-2 font-medium text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Export PDF
        </button>
      </div>

      <section className="min-w-0 rounded-md border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-base font-semibold text-gray-900">
          Product ranking by units ordered
        </h3>
        {isLoading ? (
          <SkeletonBlock
            rows={6}
            columns={4}
            title="Loading product sales ranking..."
          />
        ) : products.length === 0 ? (
          <EmptyState message="No products found." />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b bg-gray-100 text-gray-700">
                  <tr>
                    <th scope="col" className="p-3">
                      #
                    </th>
                    <th scope="col" className="p-3">
                      Item code
                    </th>
                    <th scope="col" className="p-3">
                      Name
                    </th>
                    <th scope="col" className="p-3">
                      Units ordered
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.map((product, index) => (
                    <tr
                      key={product.itemCode}
                      className="border-b last:border-0"
                    >
                      <td className="p-3 tabular-nums">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="p-3 font-mono">
                        <Link
                          className="text-blue-700 underline underline-offset-2"
                          to={`/product/${product.itemCode}`}
                        >
                          {product.itemCode}
                        </Link>
                      </td>
                      <td className="p-3">
                        <Link
                          className="text-blue-700 underline underline-offset-2"
                          to={`/product/${product.itemCode}`}
                        >
                          {product.name}
                        </Link>
                      </td>
                      <td className="p-3 tabular-nums">
                        {product.totalOrdered.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              totalItems={rankedProducts.length}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </section>
    </div>
  );
}
