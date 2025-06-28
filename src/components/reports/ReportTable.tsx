import { useEffect, useState } from "react";

type Props = {
  filter: { from: string; to: string };
};

type Entry = {
  id: number;
  type: "received" | "order" | "damage";
  itemCode: string;
  quantity: number;
  date: string;
};

export function ReportTable({ filter }: Props) {
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [receipts, orders, damages] = await Promise.all([
        fetch("http://localhost:3001/receipts").then((res) => res.json()),
        fetch("http://localhost:3001/orders").then((res) => res.json()),
        fetch("http://localhost:3001/damages").then((res) => res.json()),
      ]);

      const all: Entry[] = [
        ...receipts.map((r: any) => ({ ...r, type: "received" })),
        ...orders.map((o: any) => ({ ...o, type: "order" })),
        ...damages.map((d: any) => ({ ...d, type: "damage" })),
      ];

      const filtered = all.filter((entry) => {
        const entryDate = new Date(entry.date).getTime();
        const from = filter.from ? new Date(filter.from).getTime() : -Infinity;
        const to = filter.to ? new Date(filter.to).getTime() : Infinity;
        return entryDate >= from && entryDate <= to;
      });

      const sorted = filtered.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setEntries(sorted);
    };

    fetchData();
  }, [filter]);

  return (
    <div className="bg-white p-4 rounded shadow overflow-x-auto">
      <h3 className="text-lg font-semibold mb-4">Filtered Results</h3>
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-2">Type</th>
            <th className="p-2">Item Code</th>
            <th className="p-2">Quantity</th>
            <th className="p-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={`${entry.type}-${entry.id}`} className="border-b">
              <td className="p-2 capitalize">{entry.type}</td>
              <td className="p-2 font-mono">{entry.itemCode}</td>
              <td className="p-2">{entry.quantity}</td>
              <td className="p-2">
                {new Date(entry.date).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
