type Props = {
  value: string;
  onChange: (val: string) => void;
};

export default function SearchBar({ value, onChange }: Props) {
  return (
    <input
      type="text"
      aria-label="Search products by item code or name"
      placeholder="Search by item code or name..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full max-w-md rounded-md border border-slate-300 bg-white px-4 py-2 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
    />
  );
}
