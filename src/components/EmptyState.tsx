type Props = {
  message?: string;
};

export function EmptyState({ message = "No data available." }: Props) {
  return (
    <div className="bg-white p-4 rounded shadow ">
      <p className="text-gray-500 text-sm">{message}</p>
    </div>
  );
}
