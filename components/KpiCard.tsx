interface KpiCardProps {
  label: string;
  value: React.ReactNode;
  className?: string;
}

export default function KpiCard({ label, value, className = '' }: KpiCardProps) {
  return (
    <div className={`bg-white text-black rounded-xl p-6 shadow-lg ${className}`}>
      <div className="text-sm font-medium text-gray-600 mb-2">{label}</div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}
