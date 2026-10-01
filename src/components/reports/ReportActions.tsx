type Props = {
  onExportCSV: () => void;
  onExportPDF: () => void;
  onPrint: () => void;
  disabled?: boolean;
};

export function ReportActions({
  onExportCSV,
  onExportPDF,
  onPrint,
  disabled = false,
}: Props) {
  return (
    <div className="flex gap-4 no-print">
      <button
        type="button"
        onClick={onExportCSV}
        disabled={disabled}
        className="rounded-md bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Export to CSV
      </button>
      <button
        type="button"
        onClick={onExportPDF}
        disabled={disabled}
        className="rounded-md bg-red-700 px-4 py-2 font-medium text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Export to PDF
      </button>
      <button
        type="button"
        onClick={onPrint}
        disabled={disabled}
        className="rounded-md bg-gray-700 px-4 py-2 font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Print Report
      </button>
    </div>
  );
}
