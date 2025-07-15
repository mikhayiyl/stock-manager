export default function Legend() {
  return (
    <div className="text-sm text-gray-500 space-y-1">
      <div>
        🔴 <strong>Critical</strong> = Out of Stock
      </div>
      <div>
        🟡 <strong>Warning</strong> = Below Reorder Threshold
      </div>
      <div>
        🟢 <strong>Slow</strong> = No Sale Activity in 30+ Days
      </div>
    </div>
  );
}
