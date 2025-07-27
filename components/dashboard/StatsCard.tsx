interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  description?: string;
  status?: 'published' | 'draft' | 'total';
}

export default function StatsCard({ 
  title, 
  value, 
  icon, 
  description,
  status
}: StatsCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'published':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'draft':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
      
      {status && (
        <div className="mt-4">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor()}`}
          >
            {status === 'published' && '公開済み'}
            {status === 'draft' && '下書き'}
            {status === 'total' && '合計'}
          </span>
        </div>
      )}
    </div>
  );
}