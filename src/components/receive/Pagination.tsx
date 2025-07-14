type Props = {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
};

export function Pagination({ totalPages, currentPage, onPageChange }: Props) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-4 flex justify-center gap-2 text-sm">
      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i}
          onClick={() => onPageChange(i + 1)}
          className={`px-3 py-1 border rounded ${
            currentPage === i + 1
              ? "bg-blue-600 text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          {i + 1}
        </button>
      ))}
    </div>
  );
}
