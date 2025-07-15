import { useEffect, useState } from "react";
import type { Product } from "@/types/Product";
import { saveAs } from "file-saver";
import useProducts from "@/hooks/useProducts";
import useOrders from "@/hooks/useOrders";
import useReceipts from "@/hooks/useReceipts";
import { ReportActions } from "./ReportActions";
import { StockCard } from "./StockCard";
import { Pagination } from "./Pagination";
import pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import type { Entry } from "@/types/Entry";

pdfMake.vfs = pdfFonts.vfs;

type Props = {
  filter: { from: string; to: string; search: string };
};

type GroupedEntry = {
  receipts: Entry[];
  orders: Entry[];
};

export function StockCardReport({ filter }: Props) {
  const [grouped, setGrouped] = useState<Map<string, GroupedEntry>>(new Map());
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 5;

  const { receipts } = useReceipts();
  const { orders } = useOrders();
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
      const name = product?.name ?? "";

      entry.receipts.forEach((r) => {
        rows.push(
          `${itemCode},${name},${
            r.isExpress ? "Received (Express)" : "Received"
          },${r.quantity},${new Date(r.date).toLocaleDateString()}`
        );
      });

      entry.orders.forEach((o) => {
        rows.push(
          `${itemCode},${name},Order,${-o.quantity},${new Date(
            o.date
          ).toLocaleDateString()}`
        );
      });

      rows.push("");
    });

    const blob = new Blob([rows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    saveAs(blob, `stock_report_${Date.now()}.csv`);
  };

  const handleExportPDF = () => {
    const entriesToExport = getEntriesToExport();
    const rows: any[] = [];

    entriesToExport.forEach(([itemCode, entry]) => {
      const product = products.find((p) => p.itemCode === itemCode);
      const totalReceived = entry.receipts.reduce(
        (sum, r) => sum + r.quantity,
        0
      );
      const totalOrdered = entry.orders.reduce((sum, o) => sum + o.quantity, 0);
      const currentStock = product?.numberInStock ?? 0;

      rows.push([
        {
          text: `${product?.name ?? itemCode} (${itemCode})`,
          colSpan: 3,
          bold: true,
          margin: [0, 10, 0, 4],
        },
        {},
        {},
      ]);
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
      rows.push(["Total Received", totalReceived, ""]);
      rows.push(["Total Ordered", totalOrdered, ""]);
      rows.push([
        {
          text: `Remaining Stock: ${currentStock} ${product?.unit ?? ""}`,
          colSpan: 3,
          italics: true,
          margin: [0, 0, 0, 10],
        },
        {},
        {},
      ]);
    });

    const docDefinition = {
      content: [
        { text: "Stock Movement Report", style: "header" },
        {
          table: {
            headerRows: 1,
            widths: ["*", "auto", "auto"],
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
          groupedMap.set(r.itemCode, { receipts: [], orders: [] });
        groupedMap.get(r.itemCode)!.receipts.push(r);
      });

      filteredOrders.forEach((o) => {
        if (!groupedMap.has(o.itemCode))
          groupedMap.set(o.itemCode, { receipts: [], orders: [] });
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

  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
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
              product={products.find((p) => p.itemCode === itemCode)}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
