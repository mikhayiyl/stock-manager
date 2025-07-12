type Props = {
  value: string;
  onChange: (val: string) => void;
};

export default function SearchBar({ value, onChange }: Props) {
  return (
    <input
      type="text"
      placeholder="Search by item code or name..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full max-w-md border px-4 py-2 rounded shadow-sm"
    />
  );
}
