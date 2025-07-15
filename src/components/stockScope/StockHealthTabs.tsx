type TabKey = "reorder" | "outOfStock" | "slowMovers";

type Props = {
  active: TabKey;
  tabs: { key: TabKey; label: string }[];
  onSelect: (key: TabKey) => void;
};

export default function StockHealthTabs({ active, tabs, onSelect }: Props) {
  return (
    <div className="flex gap-4 border-b pb-1">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onSelect(tab.key)}
          className={`px-4 py-2 transition ${
            active === tab.key
              ? "border-b-2 border-blue-600 text-blue-700 font-semibold"
              : "text-gray-600 hover:text-blue-500"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
