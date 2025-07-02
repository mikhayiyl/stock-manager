type Props = {
  onExportCSV: () => void;
  onExportPDF: () => void;
  onPrint: () => void;
};

export function ReportActions({ onExportCSV, onExportPDF, onPrint }: Props) {
  return (
    <div className="flex gap-4 no-print">
      <button
        onClick={onExportCSV}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Export to CSV
      </button>
      <button
        onClick={onExportPDF}
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        Export to PDF
      </button>
      <button
        onClick={onPrint}
        className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
      >
        Print Report
      </button>
    </div>
  );
}
