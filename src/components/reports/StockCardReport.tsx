import { useEffect, useState } from "react";
import type { Product } from "@/types/Product";
import { saveAs } from "file-saver";

type Entry = {
  id: string;
  itemCode: string;
  quantity: number;
  date: string;
};

type Props = {
  filter: { from: string; to: string };
};

type GroupedEntry = {
  receipts: Entry[];
  orders: Entry[];
};

export function StockCardReport({ filter }: Props) {
  const [grouped, setGrouped] = useState<Map<string, GroupedEntry>>(new Map());
  const [products, setProducts] = useState<Product[]>([]);

  const handleExportCSV = () => {
    const rows: string[] = [];

    grouped.forEach((entry, itemCode) => {
      const product = products.find((p) => p.itemCode === itemCode);
      const totalReceived = entry.receipts.reduce(
        (sum, r) => sum + r.quantity,
        0
      );
      const totalOrdered = entry.orders.reduce((sum, o) => sum + o.quantity, 0);
      const currentStock = product?.numberInStock ?? 0;

      rows.push("");
      rows.push(`${product?.name ?? itemCode} (${itemCode}),,,`);
      rows.push("Type,Quantity,Date");

      entry.receipts.forEach((r) => {
        rows.push(
          `Received,${r.quantity},${new Date(r.date).toLocaleDateString()}`
        );
      });

      entry.orders.forEach((o) => {
        rows.push(
          `Order,-${o.quantity},${new Date(o.date).toLocaleDateString()}`
        );
      });

      rows.push(`Totals,Received: ${totalReceived},Orders: ${totalOrdered}`);
      rows.push(
        `Remaining Stock Balance:,${currentStock} ${product?.unit ?? ""}`
      );
    });

    const csvContent = rows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `stock_report_${Date.now()}.csv`);
  };

  useEffect(() => {
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
      const [receipts, orders, productsRes] = await Promise.all([
        fetch("http://localhost:3001/receipts").then((res) => res.json()),
        fetch("http://localhost:3001/orders").then((res) => res.json()),
        fetch("http://localhost:3001/products").then((res) => res.json()),
      ]);

      const groupedMap = new Map<string, GroupedEntry>();

      receipts
        .filter((r: Entry) => isInRange(r.date))
        .forEach((r: Entry) => {
          if (!groupedMap.has(r.itemCode))
            groupedMap.set(r.itemCode, { receipts: [], orders: [] });
          groupedMap.get(r.itemCode)!.receipts.push(r);
        });

      orders
        .filter((o: Entry) => isInRange(o.date))
        .forEach((o: Entry) => {
          if (!groupedMap.has(o.itemCode))
            groupedMap.set(o.itemCode, { receipts: [], orders: [] });
          groupedMap.get(o.itemCode)!.orders.push(o);
        });

      setGrouped(groupedMap);
      setProducts(productsRes);
    };

    fetchData();
  }, [filter]);

  return (
    <div className="space-y-6">
      <button
        onClick={handleExportCSV}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-4"
      >
        Export to CSV
      </button>

      {Array.from(grouped.entries()).map(([itemCode, { receipts, orders }]) => {
        const totalReceived = receipts.reduce((sum, r) => sum + r.quantity, 0);
        const totalOrdered = orders.reduce((sum, o) => sum + o.quantity, 0);
        const product = products.find((p) => p.itemCode === itemCode);
        const currentStock = product?.numberInStock ?? 0;

        return (
          <div key={itemCode} className="border p-4 rounded shadow bg-white">
            <h4 className="font-bold text-lg mb-2">
              {product?.name ?? itemCode}{" "}
              <span className="text-sm text-gray-500">({itemCode})</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">
                  Receipts
                </p>
                <ul className="text-sm space-y-1">
                  {receipts.map((r) => (
                    <li key={r.id}>
                      +{r.quantity} on {new Date(r.date).toLocaleDateString()}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 font-medium text-blue-700">
                  Total Received: {totalReceived}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">
                  Orders
                </p>
                <ul className="text-sm space-y-1">
                  {orders.map((o) => (
                    <li key={o.id}>
                      –{o.quantity} on {new Date(o.date).toLocaleDateString()}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 font-medium text-red-700">
                  Total Ordered: {totalOrdered}
                </p>
              </div>
            </div>

            <p className="mt-4 font-semibold text-green-700">
              Remaining Stock Balance: {currentStock} {product?.unit ?? ""}
            </p>
          </div>
        );
      })}
    </div>
  );
}
