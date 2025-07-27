'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useMonologueManagement, Monologue } from '@/hooks/useContentManagement';

export default function MonologuesPage() {
  const {
    monologues,
    loading,
    error,
    fetchMonologues,
    deleteMonologue,
    publishMonologue,
    unpublishMonologue,
  } = useMonologueManagement();

  const [selectedMonologues, setSelectedMonologues] = useState<string[]>([]);

  useEffect(() => {
    fetchMonologues(50, 0);
  }, [fetchMonologues]);

  const handleDelete = async (id: string) => {
    if (window.confirm('本当に削除しますか？')) {
      await deleteMonologue(id);
    }
  };

  const handleTogglePublish = async (monologue: Monologue) => {
    if (monologue.isPublished) {
      await unpublishMonologue(monologue.id);
    } else {
      await publishMonologue(monologue.id);
    }
  };

  const handleSelectMonologue = (id: string) => {
    setSelectedMonologues(prev =>
      prev.includes(id)
        ? prev.filter(monoId => monoId !== id)
        : [...prev, id]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP');
  };

  const getContentTypeIcon = (type: string) => {
    const icons = {
      POST: '📝',
      CODE: '💻',
      IMAGE: '🖼️',
      URL_PREVIEW: '🔗',
      BLOG: '📰',
    };
    return icons[type as keyof typeof icons] || '📝';
  };


  const truncateContent = (content: string, maxLength = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">モノローグ管理</h1>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => window.location.href = '/monologues/new'}
            >
              新規作成
            </Button>
            {selectedMonologues.length > 0 && (
              <Button
                variant="destructive"
                onClick={() => {
                  if (window.confirm(`選択した${selectedMonologues.length}件のモノローグを削除しますか？`)) {
                    selectedMonologues.forEach(id => deleteMonologue(id));
                    setSelectedMonologues([]);
                  }
                }}
              >
                選択削除 ({selectedMonologues.length})
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
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </Card>
            ))}
          </div>
        ) : monologues.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500 mb-4">モノローグがまだありません</p>
            <Button onClick={() => window.location.href = '/monologues/new'}>
              最初のモノローグを作成
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {monologues.map((monologue) => (
              <Card key={monologue.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedMonologues.includes(monologue.id)}
                      onChange={() => handleSelectMonologue(monologue.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">
                          {getContentTypeIcon(monologue.contentType)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          monologue.isPublished 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {monologue.isPublished ? '公開済み' : '下書き'}
                        </span>
                      </div>
                      
                      <p className="text-gray-900 text-sm mb-3 whitespace-pre-line">
                        {truncateContent(monologue.content)}
                      </p>
                      
                      {monologue.codeSnippet && (
                        <div className="bg-gray-100 rounded p-2 mb-3 text-xs font-mono">
                          <div className="text-gray-600 mb-1">
                            {monologue.codeLanguage || 'Code'}:
                          </div>
                          <pre className="text-gray-800 whitespace-pre-wrap">
                            {truncateContent(monologue.codeSnippet, 150)}
                          </pre>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                        <span>タイプ: {monologue.contentType}</span>
                        <span>作成: {formatDate(monologue.createdAt)}</span>
                        <span>更新: {formatDate(monologue.updatedAt)}</span>
                        {monologue.publishedAt && (
                          <span>公開: {formatDate(monologue.publishedAt)}</span>
                        )}
                        {monologue.likeCount !== undefined && (
                          <span>👍 {monologue.likeCount}</span>
                        )}
                      </div>
                      
                      {monologue.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {monologue.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {monologue.url && (
                        <div className="mt-2">
                          <a
                            href={monologue.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-xs"
                          >
                            🔗 {monologue.url}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.href = `/monologues/${monologue.id}/edit`}
                    >
                      編集
                    </Button>
                    <Button
                      variant={monologue.isPublished ? 'outline' : 'default'}
                      size="sm"
                      onClick={() => handleTogglePublish(monologue)}
                      disabled={loading}
                    >
                      {monologue.isPublished ? '非公開' : '公開'}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(monologue.id)}
                      disabled={loading}
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
            {monologues.length}件のモノローグ
            {selectedMonologues.length > 0 && ` (${selectedMonologues.length}件選択中)`}
          </p>
          <Button
            variant="outline"
            onClick={() => fetchMonologues(50, monologues.length)}
            disabled={loading}
          >
            もっと読み込む
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}