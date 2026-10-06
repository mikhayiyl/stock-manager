type TabKey = "reorder" | "outOfStock" | "slowMovers";

type Props = {
  active: TabKey;
  tabs: { key: TabKey; label: string }[];
  onSelect: (key: TabKey) => void;
};

export default function StockHealthTabs({ active, tabs, onSelect }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Stock health categories"
      className="flex gap-2 overflow-x-auto border-b pb-1"
    >
      {tabs.map((tab) => (
        <button
          key={tab.key}
          id={`stock-health-tab-${tab.key}`}
          type="button"
          role="tab"
          aria-selected={active === tab.key}
          aria-controls="stock-health-panel"
          tabIndex={active === tab.key ? 0 : -1}
          onClick={() => onSelect(tab.key)}
          onKeyDown={(event) => {
            const currentIndex = tabs.findIndex((item) => item.key === tab.key);
            let nextIndex: number | null = null;

            if (event.key === "ArrowRight") {
              nextIndex = (currentIndex + 1) % tabs.length;
            } else if (event.key === "ArrowLeft") {
              nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
            } else if (event.key === "Home") {
              nextIndex = 0;
            } else if (event.key === "End") {
              nextIndex = tabs.length - 1;
            }

            if (nextIndex !== null) {
              event.preventDefault();
              const nextTab = tabs[nextIndex];
              onSelect(nextTab.key);
              document
                .getElementById(`stock-health-tab-${nextTab.key}`)
                ?.focus();
            }
          }}
          className={`shrink-0 border-b-2 px-4 py-2 text-sm transition ${
            active === tab.key
              ? "border-emerald-700 font-semibold text-emerald-800"
              : "border-transparent text-slate-600 hover:text-emerald-800"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
