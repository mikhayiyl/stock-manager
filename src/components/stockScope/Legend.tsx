export default function Legend() {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-600">
      <li className="flex items-center gap-2">
        <span aria-hidden="true" className="size-2 rounded-full bg-red-600" />
        <span>
          <strong>Critical:</strong> out of stock
        </span>
      </li>
      <li className="flex items-center gap-2">
        <span aria-hidden="true" className="size-2 rounded-full bg-amber-500" />
        <span>
          <strong>Warning:</strong> at or below 7-day sales cover
        </span>
      </li>
      <li className="flex items-center gap-2">
        <span aria-hidden="true" className="size-2 rounded-full bg-gray-500" />
        <span>
          <strong>Lowest sales:</strong> five lowest 30-day average unit sales
          among in-stock products
        </span>
      </li>
      <li className="flex items-center gap-2">
        <span aria-hidden="true" className="size-2 rounded-full bg-green-600" />
        <span>
          <strong>Healthy:</strong> above target with recent sales
        </span>
      </li>
    </ul>
  );
}
