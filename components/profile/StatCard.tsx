// components/profile/StatCard.tsx
interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: string;
  description?: string;
}

const StatCard = ({ title, value, icon, trend, description }: StatCardProps) => {
  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {description && <p className="text-xs text-gray-500 mt-2">{description}</p>}
        </div>
        {icon && <div className="text-blue-600">{icon}</div>}
      </div>
      {trend && (
        <div className={`mt-3 text-sm ${trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
          {trend}
        </div>
      )}
    </div>
  );
};