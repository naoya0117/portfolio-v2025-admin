import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const quickActions = [
  {
    title: '新しいブログ記事を作成',
    description: '記事の執筆を開始',
    href: '/blogs/new',
    icon: '✏️',
    color: 'bg-blue-50 hover:bg-blue-100 border-blue-200'
  },
  {
    title: 'モノローグを追加',
    description: '技術的な考察を記録',
    href: '/monologues/new',
    icon: '💡',
    color: 'bg-green-50 hover:bg-green-100 border-green-200'
  },
  {
    title: 'ブログ記事管理',
    description: '既存記事の編集・管理',
    href: '/blogs',
    icon: '📝',
    color: 'bg-purple-50 hover:bg-purple-100 border-purple-200'
  },
  {
    title: 'カテゴリ管理',
    description: 'コンテンツの分類を管理',
    href: '/categories',
    icon: '📁',
    color: 'bg-orange-50 hover:bg-orange-100 border-orange-200'
  }
];

export default function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <span className="mr-2">⚡</span>
          クイックアクション
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <div className={`p-4 rounded-lg border transition-colors cursor-pointer ${action.color}`}>
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{action.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 text-sm">
                      {action.title}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      {action.description}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}