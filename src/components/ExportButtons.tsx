import type { Entry } from "@/types/Entry";
import { saveAs } from "file-saver";
import pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.vfs;

type Props = {
  filteredProducts: {
    itemCode: string;
    name: string;
    numberInStock: number;
  }[];
  damagedMap: Map<string, Entry[]>;
  selectedFilters: ("Damaged" | "Low Stock" | "Out of Stock")[];
};

export function ExportButtons({
  filteredProducts,
  selectedFilters,
  damagedMap,
}: Props) {
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
  return (
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
  );
}
