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
    <div className="flex flex-wrap gap-3 no-print">
      <button
        type="button"
        onClick={onExportCSV}
        disabled={disabled}
        className="rounded-md bg-emerald-700 px-4 py-2 font-medium text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Export to CSV
      </button>
      <button
        type="button"
        onClick={onExportPDF}
        disabled={disabled}
        className="rounded-md border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Export to PDF
      </button>
      <button
        type="button"
        onClick={onPrint}
        disabled={disabled}
        className="rounded-md border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Print Report
      </button>
    </div>
  );
}
