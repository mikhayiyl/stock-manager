import { useEffect, useState } from "react";
import type { Product } from "@/types/Product";
import { saveAs } from "file-saver";
import useProducts from "@/hooks/useProducts";
import useOrders from "@/hooks/useOrders";
import useReceipts from "@/hooks/useReceipts";
import { ReportActions } from "./ReportActions";
import { StockCard } from "./StockCard";
import pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import type { GroupedEntry } from "@/types/Entry";
import Pagination from "../PaginationBar";
import useDamages from "@/hooks/useDamages";
import type { Content, TDocumentDefinitions } from "pdfmake/interfaces";
import { useStockMetrics } from "@/hooks/useStockMetrics";

pdfMake.vfs = pdfFonts.vfs;

type Props = {
  filter: { from: string; to: string; search: string };
};

export function StockCardReport({ filter }: Props) {
  const [grouped, setGrouped] = useState<Map<string, GroupedEntry>>(new Map());
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;

  const { receipts } = useReceipts();
  const { orders } = useOrders();
  const { damages } = useDamages();

  const { products: productsRes } = useProducts();

  const isFilterActive = () =>
    filter.from.trim() !== "" ||
    filter.to.trim() !== "" ||
    filter.search.trim() !== "";

  const getEntriesToExport = () =>
    isFilterActive()
      ? filteredEntries
      : Array.from(grouped.entries()).slice(0, 20);

  const handleExportCSV = () => {
    const entriesToExport = getEntriesToExport();
    const rows: string[] = ["Item Code,Item Name,Type,Quantity,Date"];

    entriesToExport.forEach(([itemCode, entry]) => {
      const product = products.find((p) => p.itemCode === itemCode);
      const metrics = useStockMetrics(
        itemCode,
        { damages, receipts: entry.receipts, orders: entry.orders },
        product
      );

      entry.receipts.forEach((r) => {
        rows.push(
          `${itemCode},${metrics.name},${
            r.isExpress ? "Received (Express)" : "Received"
          },${r.quantity},${new Date(r.date).toLocaleDateString()}`
        );
      });

      entry.orders.forEach((o) => {
        rows.push(
          `${itemCode},${metrics.name},Order,-${o.quantity},${new Date(
            o.date
          ).toLocaleDateString()}`
        );
      });

      entry.damages.forEach((d) => {
        const disposed =
          d.resolutionHistory?.filter((r) => r.type === "disposed") ?? [];
        disposed.forEach((r) => {
          rows.push(
            `${itemCode},${metrics.name},Disposed,-${r.quantity},${new Date(
              d.date
            ).toLocaleDateString()}`
          );
        });
      });

      rows.push(`${itemCode},${metrics.name},-- Totals --,,`);
      rows.push(
        `${itemCode},${metrics.name},Opening Balance,${metrics.previousBalance},`
      );
      rows.push(
        `${itemCode},${metrics.name},Movement Total,${metrics.movementTotal}${metrics.unit},`
      );
      rows.push(
        `${itemCode},${metrics.name},Current Stock,${metrics.currentStock} ${metrics.unit},`
      );
      rows.push("");
    });

    const blob = new Blob([rows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    saveAs(blob, `stock_report_${Date.now()}.csv`);
  };

  const handleExportPDF = () => {
    const entriesToExport = getEntriesToExport();

    const contentBlocks: Content[] = [];

    entriesToExport.forEach(([itemCode, entry]) => {
      const product = products.find((p) => p.itemCode === itemCode);
      if (!product) return;

      const name = product.name ?? itemCode;
      const unit = product.unit ?? "";
      const currentStock = product.numberInStock ?? 0;

      const totalReceived = entry.receipts.reduce(
        (sum, r) => sum + r.quantity,
        0
      );
      const totalOrdered = entry.orders.reduce((sum, o) => sum + o.quantity, 0);
      const totalDisposed = entry.damages.reduce((sum, d) => {
        if (!Array.isArray(d.resolutionHistory)) return sum;
        return (
          sum +
          d.resolutionHistory
            .filter((r) => r.type === "disposed")
            .reduce((s, r) => s + r.quantity, 0)
        );
      }, 0);

      const previousBalance =
        currentStock - totalReceived + totalOrdered + totalDisposed;
      const movementTotal =
        previousBalance + totalReceived - totalOrdered - totalDisposed;

      const rows: any[] = [];
      rows.push(["Type", "Quantity", "Date"]);

      entry.receipts.forEach((r) => {
        rows.push([
          r.isExpress ? "Received (Express)" : "Received",
          r.quantity,
          new Date(r.date).toLocaleDateString(),
        ]);
      });

      entry.orders.forEach((o) => {
        rows.push([
          "Order",
          -o.quantity,
          new Date(o.date).toLocaleDateString(),
        ]);
      });

      entry.damages.forEach((d) => {
        const disposed =
          d.resolutionHistory?.filter((r) => r.type === "disposed") ?? [];
        disposed.forEach((r) => {
          rows.push([
            "Disposed",
            -r.quantity,
            new Date(d.date).toLocaleDateString(),
          ]);
        });
      });

      rows.push([
        {
          text: "— Totals —",
          colSpan: 3,
          alignment: "center",
          margin: [0, 10, 0, 4],
          bold: true,
        },
        {},
        {},
      ]);
      rows.push(["Opening Balance", previousBalance, ""]);
      rows.push(["Movement Total", movementTotal, ""]);
      rows.push(["Current Stock Balance", `${currentStock} ${unit}`, ""]);

      contentBlocks.push({
        text: `${name} (${itemCode})`,
        style: "subheader",
        pageBreak: "before",
        margin: [0, 10, 0, 4],
      });

      contentBlocks.push({
        table: {
          headerRows: 1,
          widths: ["*", "auto", "auto"],
          body: rows,
        },
        layout: "lightHorizontalLines",
      });
    });

    const docDefinition: TDocumentDefinitions = {
      content: [
        { text: "Stock Movement Report", style: "header" },
        ...contentBlocks,
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10],
        },
        subheader: {
          fontSize: 14,
          bold: true,
          margin: [0, 10, 0, 6],
        },
      },
    };

    pdfMake.createPdf(docDefinition).download(`stock_report_${Date.now()}.pdf`);
  };

  useEffect(() => {
    if (receipts.length === 0 && orders.length === 0) return;

    const isInRange = (dateStr: string) => {
      const entryTime = new Date(dateStr).getTime();
      const fromTime = filter.from
        ? new Date(filter.from + "T00:00:00").getTime()
        : -Infinity;
      const toTime = filter.to
        ? new Date(filter.to + "T23:59:59").getTime()
        : Infinity;
      return entryTime >= fromTime && entryTime <= toTime;
    };

    const fetchData = async () => {
      setLoading(true);
      const groupedMap = new Map<string, GroupedEntry>();

      const filteredDamages = isFilterActive()
        ? damages.filter((d) => isInRange(d.date))
        : [...damages]
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            )
            .slice(0, 20);

      filteredDamages.forEach((d) => {
        if (!groupedMap.has(d.itemCode))
          groupedMap.set(d.itemCode, { receipts: [], orders: [], damages: [] });
        groupedMap.get(d.itemCode)!.damages.push(d);
      });

      const filteredReceipts = isFilterActive()
        ? receipts.filter((r) => isInRange(r.date))
        : [...receipts]
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            )
            .slice(0, 20);

      const filteredOrders = isFilterActive()
        ? orders.filter((o) => isInRange(o.date))
        : [...orders]
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            )
            .slice(0, 20);

      filteredReceipts.forEach((r) => {
        if (!groupedMap.has(r.itemCode))
          groupedMap.set(r.itemCode, { receipts: [], orders: [], damages: [] });
        groupedMap.get(r.itemCode)!.receipts.push(r);
      });

      filteredOrders.forEach((o) => {
        if (!groupedMap.has(o.itemCode))
          groupedMap.set(o.itemCode, { receipts: [], orders: [], damages: [] });
        groupedMap.get(o.itemCode)!.orders.push(o);
      });

      setGrouped(groupedMap);
      setProducts(productsRes);
      setCurrentPage(1);
      setLoading(false);
    };

    fetchData();
  }, [filter, receipts, orders]);

  const filteredEntries = Array.from(grouped.entries()).filter(([itemCode]) => {
    const product = products.find((p) => p.itemCode === itemCode);
    const search = filter.search.toLowerCase();
    return (
      itemCode.toLowerCase().includes(search) ||
      product?.name?.toLowerCase().includes(search)
    );
  });

  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return <p className="text-center text-gray-500">Loading report...</p>;
  }

  return (
    <div className="space-y-6">
      <ReportActions
        onExportCSV={handleExportCSV}
        onExportPDF={handleExportPDF}
        onPrint={() => window.print()}
      />

      {!isFilterActive() && grouped.size === 0 ? (
        <p className="text-center text-gray-500">
          Showing latest receipts. Apply filters to refine.
        </p>
      ) : paginatedEntries.length === 0 ? (
        <p className="text-center text-gray-500">No entries found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {paginatedEntries.map(([itemCode, { receipts, orders }]) => (
            <StockCard
              key={itemCode}
              itemCode={itemCode}
              receipts={receipts}
              orders={orders}
              damages={damages}
              product={products.find((p) => p.itemCode === itemCode)}
            />
          ))}
        </div>
      )}

      <Pagination
        currentPage={currentPage}
        totalItems={filteredEntries.length}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
      />
    </div>
  );
}
