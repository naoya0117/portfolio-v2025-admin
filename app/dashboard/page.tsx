'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsCard from '@/components/dashboard/StatsCard';
import RecentActivity from '@/components/dashboard/RecentActivity';
import QuickActions from '@/components/dashboard/QuickActions';
import { useDashboardData } from '@/hooks/useDashboardData';

export default function DashboardPage() {
  const stats = useDashboardData();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">おかえりなさい！</h1>
          <p className="text-blue-100">
            ポートフォリオサイトの管理ダッシュボードです。最新の統計情報と活動状況をご確認ください。
          </p>
        </div>

        {/* Stats Grid */}
        {stats.loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        ) : stats.error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">データの読み込みに失敗しました: {stats.error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="ブログ記事（公開済み）"
              value={stats.publishedBlogPosts}
              icon="📝"
              description="公開中の記事"
              status="published"
            />
            <StatsCard
              title="ブログ記事（下書き）"
              value={stats.draftBlogPosts}
              icon="📄"
              description="下書き保存中"
              status="draft"
            />
            <StatsCard
              title="モノローグ（公開済み）"
              value={stats.publishedMonologues}
              icon="💭"
              description="公開中のモノローグ"
              status="published"
            />
            <StatsCard
              title="モノローグ（下書き）"
              value={stats.draftMonologues}
              icon="💡"
              description="下書き保存中"
              status="draft"
            />
          </div>
        )}

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <QuickActions />
          <RecentActivity />
        </div>

        {/* System Summary */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">コンテンツ概要</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <dt className="font-medium text-gray-600">総コンテンツ数</dt>
              <dd className="text-gray-900 mt-1 text-lg font-semibold">
                {stats.loading ? '...' : stats.totalBlogPosts + stats.totalMonologues}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-gray-600">公開済み</dt>
              <dd className="text-green-600 mt-1 text-lg font-semibold flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                {stats.loading ? '...' : stats.publishedBlogPosts + stats.publishedMonologues}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-gray-600">下書き</dt>
              <dd className="text-orange-600 mt-1 text-lg font-semibold flex items-center">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                {stats.loading ? '...' : stats.draftBlogPosts + stats.draftMonologues}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-gray-600">システム</dt>
              <dd className="text-blue-600 mt-1 flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                稼働中
              </dd>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}