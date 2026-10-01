import { useEffect, useState } from "react";
import { saveAs } from "file-saver";
import pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import type { Content, TDocumentDefinitions } from "pdfmake/interfaces";
import type { GroupedEntry } from "@/types/Entry";
import useProducts from "@/hooks/useProducts";
import useOrders from "@/hooks/useOrders";
import useReceipts from "@/hooks/useReceipts";
import useDamages from "@/hooks/useDamages";
import { calculateStockMetrics } from "@/hooks/useStockMetrics";
import { ReportActions } from "./ReportActions";
import { StockCard } from "./StockCard";
import Pagination from "../PaginationBar";
import { EmptyState } from "@/components/EmptyState";
import { SkeletonBlock } from "@/components/SkeletonBlock";

pdfMake.vfs = pdfFonts.vfs;

type Props = {
  filter: { from: string; to: string; search: string };
};

type ReportItem = {
  itemCode: string;
  entry: GroupedEntry;
  metrics: ReturnType<typeof calculateStockMetrics>;
};

const csvCell = (value: string | number) => {
  const text = String(value);
  const safeText =
    typeof value === "string" && /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${safeText.replace(/"/g, '""')}"`;
};

const formatDate = (date: string) => {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime())
    ? "Invalid date"
    : parsed.toLocaleString("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
      });
};

export function StockCardReport({ filter }: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { receipts, isLoading: receiptsLoading } = useReceipts();
  const { orders, isLoading: ordersLoading } = useOrders();
  const {
    damages,
    isLoading: damagesLoading,
    error: damagesError,
    refresh: refreshDamages,
  } = useDamages();
  const { products, isLoading: productsLoading } = useProducts();
  const isLoading =
    receiptsLoading || ordersLoading || damagesLoading || productsLoading;
  const invalidDateRange =
    Boolean(filter.from && filter.to) && filter.from > filter.to;

  const allEntries = new Map<string, GroupedEntry>();
  const getEntry = (itemCode: string) => {
    let entry = allEntries.get(itemCode);
    if (!entry) {
      entry = { receipts: [], orders: [], damages: [] };
      allEntries.set(itemCode, entry);
    }
    return entry;
  };

  receipts.forEach((receipt) =>
    getEntry(receipt.itemCode).receipts.push(receipt),
  );
  orders.forEach((order) => getEntry(order.itemCode).orders.push(order));
  damages.forEach((damage) => getEntry(damage.itemCode).damages.push(damage));

  const productsByCode = new Map(
    products.map((product) => [product.itemCode.toLowerCase(), product]),
  );
  const search = filter.search.trim().toLowerCase();
  const reportItems: ReportItem[] = invalidDateRange
    ? []
    : Array.from(allEntries.entries())
        .map(([itemCode, entry]) => ({
          itemCode,
          entry,
          metrics: calculateStockMetrics(
            itemCode,
            entry,
            productsByCode.get(itemCode.toLowerCase()),
            filter,
          ),
        }))
        .filter(({ itemCode, metrics }) => {
          const productName =
            productsByCode.get(itemCode.toLowerCase())?.name.toLowerCase() ??
            "";
          return (
            metrics.movements.length > 0 &&
            (!search ||
              itemCode.toLowerCase().includes(search) ||
              productName.includes(search))
          );
        })
        .sort((left, right) =>
          left.metrics.name.localeCompare(right.metrics.name),
        );

  useEffect(() => {
    setCurrentPage(1);
  }, [filter.from, filter.to, filter.search]);

  const handleExportCSV = () => {
    const rows: (string | number)[][] = [
      [
        "Item Code",
        "Product",
        "Unit",
        "Activity",
        "Quantity",
        "Stock Change",
        "Balance After",
        "Unmatched Outbound",
        "Date",
        "Notes",
      ],
    ];

    reportItems.forEach(({ itemCode, metrics }) => {
      metrics.movements.forEach((movement) => {
        rows.push([
          itemCode,
          metrics.name,
          metrics.unit,
          movement.type,
          movement.quantity,
          movement.stockChange,
          movement.balanceAfter,
          movement.unmatchedOutbound,
          formatDate(movement.date),
          movement.notes,
        ]);
      });
      rows.push([
        itemCode,
        metrics.name,
        metrics.unit,
        "Opening balance",
        metrics.previousBalance,
        "",
        metrics.previousBalance,
        "",
        "",
        "",
      ]);
      rows.push([
        itemCode,
        metrics.name,
        metrics.unit,
        "Net stock change",
        metrics.movementTotal,
        "",
        metrics.closingBalance,
        "",
        "",
        "",
      ]);
      rows.push([
        itemCode,
        metrics.name,
        metrics.unit,
        "Unmatched outbound",
        metrics.unmatchedOutbound,
        "",
        "",
        "",
        "",
        "",
      ]);
      rows.push([
        itemCode,
        metrics.name,
        metrics.unit,
        "Closing balance",
        metrics.closingBalance,
        "",
        metrics.closingBalance,
        "",
        "",
        "",
      ]);
      rows.push([
        itemCode,
        metrics.name,
        metrics.unit,
        "Current stock now",
        metrics.currentStock,
        "",
        "",
        "",
        "",
        "",
      ]);
      rows.push([]);
    });

    const csv = rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
    saveAs(
      new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" }),
      `stock_movement_${Date.now()}.csv`,
    );
  };

  const handleExportPDF = () => {
    const content: Content[] = [
      { text: "Stock Movement Report", style: "header" },
      {
        text: `Date range: ${filter.from || "All dates"} to ${filter.to || "All dates"}`,
        margin: [0, 0, 0, 10],
      },
    ];

    reportItems.forEach(({ itemCode, metrics }) => {
      const body: string[][] = [
        [
          "Activity",
          "Quantity",
          "Stock change",
          "Balance after",
          "Unmatched outbound",
          "Date",
          "Notes",
        ],
        ...metrics.movements.map((movement) => [
          movement.type,
          `${movement.quantity} ${metrics.unit}`,
          movement.stockChange === 0
            ? "—"
            : `${movement.stockChange > 0 ? "+" : ""}${movement.stockChange} ${metrics.unit}`,
          `${movement.balanceAfter} ${metrics.unit}`,
          movement.unmatchedOutbound > 0
            ? `${movement.unmatchedOutbound} ${metrics.unit}`
            : "—",
          formatDate(movement.date),
          movement.notes || "—",
        ]),
        [
          "Opening balance",
          `${metrics.previousBalance} ${metrics.unit}`,
          "",
          `${metrics.previousBalance} ${metrics.unit}`,
          "",
          "",
          "",
        ],
        [
          "Net stock change",
          `${metrics.movementTotal} ${metrics.unit}`,
          "",
          `${metrics.closingBalance} ${metrics.unit}`,
          "",
          "",
          "",
        ],
        [
          "Unmatched outbound",
          `${metrics.unmatchedOutbound} ${metrics.unit}`,
          "",
          "",
          `${metrics.unmatchedOutbound} ${metrics.unit}`,
          "",
          "",
        ],
        [
          "Closing balance",
          `${metrics.closingBalance} ${metrics.unit}`,
          "",
          `${metrics.closingBalance} ${metrics.unit}`,
          "",
          "",
          "",
        ],
        [
          "Current stock now",
          `${metrics.currentStock} ${metrics.unit}`,
          "",
          "",
          "",
          "",
          "",
        ],
      ];

      content.push({
        text: `${metrics.name} (${itemCode})`,
        style: "subheader",
        margin: [0, 12, 0, 5],
      });
      content.push({
        table: {
          headerRows: 1,
          widths: ["*", "auto", "auto", "auto", "auto", "auto", "*"],
          body,
        },
        layout: "lightHorizontalLines",
      });
    });

    const definition: TDocumentDefinitions = {
      pageOrientation: "landscape",
      content,
      styles: {
        header: { fontSize: 18, bold: true, margin: [0, 0, 0, 8] },
        subheader: { fontSize: 13, bold: true },
      },
    };

    pdfMake.createPdf(definition).download(`stock_movement_${Date.now()}.pdf`);
  };

  if (isLoading) {
    return (
      <SkeletonBlock
        variant="card"
        rows={2}
        title="Loading stock movement report..."
      />
    );
  }

  if (damagesError) {
    return (
      <section className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        <p>{damagesError}</p>
        <button
          type="button"
          onClick={refreshDamages}
          className="font-medium underline underline-offset-2"
        >
          Retry
        </button>
      </section>
    );
  }

  if (invalidDateRange) {
    return (
      <EmptyState message="The start date must be on or before the end date." />
    );
  }

  if (reportItems.length === 0) {
    return <EmptyState message="No stock movements match these filters." />;
  }

  const paginatedItems = reportItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="min-w-0 space-y-6">
      <ReportActions
        disabled={reportItems.length === 0}
        onExportCSV={handleExportCSV}
        onExportPDF={handleExportPDF}
        onPrint={() => window.print()}
      />
      <p className="text-xs text-gray-500 no-print">
        Exports include all {reportItems.length} products matching these
        filters, across all pages.
      </p>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {paginatedItems.map(({ itemCode, entry }) => (
          <StockCard
            key={itemCode}
            itemCode={itemCode}
            receipts={entry.receipts}
            orders={entry.orders}
            damages={entry.damages}
            product={productsByCode.get(itemCode.toLowerCase())}
            range={filter}
          />
        ))}
      </div>
      <Pagination
        currentPage={currentPage}
        totalItems={reportItems.length}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
      />
    </div>
  );
}
