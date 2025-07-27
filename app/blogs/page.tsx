'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useBlogManagement, BlogPost } from '@/hooks/useContentManagement';

export default function BlogsPage() {
  const {
    blogPosts,
    loading,
    error,
    fetchBlogPosts,
    deleteBlogPost,
    publishBlogPost,
    unpublishBlogPost,
  } = useBlogManagement();

  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);

  useEffect(() => {
    fetchBlogPosts();
  }, [fetchBlogPosts]);

  const handleDelete = async (id: string) => {
    if (window.confirm('本当に削除しますか？')) {
      await deleteBlogPost(id);
    }
  };

  const handleTogglePublish = async (post: BlogPost) => {
    if (post.status === 'PUBLISHED') {
      await unpublishBlogPost(post.id);
    } else {
      await publishBlogPost(post.id);
    }
  };

  const handleSelectPost = (id: string) => {
    setSelectedPosts(prev =>
      prev.includes(id)
        ? prev.filter(postId => postId !== id)
        : [...prev, id]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PUBLISHED: { color: 'bg-green-100 text-green-800', text: '公開済み' },
      DRAFT: { color: 'bg-gray-100 text-gray-800', text: '下書き' },
      ARCHIVED: { color: 'bg-red-100 text-red-800', text: 'アーカイブ' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">ブログ記事管理</h1>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => window.location.href = '/blogs/new'}
            >
              新規作成
            </Button>
            {selectedPosts.length > 0 && (
              <Button
                variant="destructive"
                onClick={() => {
                  if (window.confirm(`選択した${selectedPosts.length}件の記事を削除しますか？`)) {
                    selectedPosts.forEach(id => deleteBlogPost(id));
                    setSelectedPosts([]);
                  }
                }}
              >
                選択削除 ({selectedPosts.length})
              </Button>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">エラー: {error}</p>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-4 md:p-6 animate-pulse">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    <div className="flex flex-wrap gap-1">
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                  <div className="flex flex-col md:flex-row gap-2">
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : blogPosts.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500 mb-4">ブログ記事がまだありません</p>
            <Button onClick={() => window.location.href = '/blogs/new'}>
              最初の記事を作成
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {blogPosts.map((post) => (
              <Card key={post.id} className="p-4 md:p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex items-start space-x-3 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedPosts.includes(post.id)}
                      onChange={() => handleSelectPost(post.id)}
                      className="mt-1 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {post.title}
                        </h3>
                        {getStatusBadge(post.status)}
                      </div>
                      {post.excerpt && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500 mb-2">
                        <span className="truncate">スラッグ: {post.slug}</span>
                        <span className="flex-shrink-0">作成: {formatDate(post.createdAt)}</span>
                        <span className="flex-shrink-0">更新: {formatDate(post.updatedAt)}</span>
                        {post.publishedAt && (
                          <span className="flex-shrink-0">公開: {formatDate(post.publishedAt)}</span>
                        )}
                      </div>
                      {post.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {post.tags?.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded flex-shrink-0"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-row md:flex-col lg:flex-row gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.href = `/blogs/${post.id}/edit`}
                      className="flex-1 md:flex-none lg:flex-1"
                    >
                      編集
                    </Button>
                    <Button
                      variant={post.status === 'PUBLISHED' ? 'outline' : 'default'}
                      size="sm"
                      onClick={() => handleTogglePublish(post)}
                      disabled={loading}
                      className="flex-1 md:flex-none lg:flex-1"
                    >
                      {post.status === 'PUBLISHED' ? '非公開' : '公開'}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(post.id)}
                      disabled={loading}
                      className="flex-1 md:flex-none lg:flex-1"
                    >
                      削除
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">
            {blogPosts.length}件の記事
            {selectedPosts.length > 0 && ` (${selectedPosts.length}件選択中)`}
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}