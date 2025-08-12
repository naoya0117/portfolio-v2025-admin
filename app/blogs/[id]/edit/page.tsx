'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ZennEditor } from '@/components/ui/zenn-editor';
import { useBlogManagement, BlogPost, UpdateBlogPostInput } from '@/hooks/useContentManagement';

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const { fetchBlogPostById, updateBlogPost, loading } = useBlogManagement();
  
  const [post, setPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState<UpdateBlogPostInput>({});
  const [tagInput, setTagInput] = useState('');

  const loadBlogPost = useCallback(async (id: string) => {
    try {
      const result = await fetchBlogPostById(id) as { blogPostByID: BlogPost } | null;
      if (result?.blogPostByID) {
        setPost(result.blogPostByID);
        setFormData({
          title: result.blogPostByID.title,
          slug: result.blogPostByID.slug,
          excerpt: result.blogPostByID.excerpt || '',
          content: result.blogPostByID.content,
          coverImageUrl: result.blogPostByID.coverImageUrl || '',
          tags: result.blogPostByID.tags || [],
          status: result.blogPostByID.status,
          seoTitle: result.blogPostByID.seoTitle || '',
          seoDescription: result.blogPostByID.seoDescription || '',
        });
      }
    } catch (error) {
      console.error('ブログ記事の読み込みに失敗しました:', error);
    }
  }, [fetchBlogPostById]);

  useEffect(() => {
    if (params.id) {
      loadBlogPost(params.id as string);
    }
  }, [params.id, loadBlogPost]);

  const handleInputChange = (field: keyof UpdateBlogPostInput, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (tagInput.trim() && formData.tags && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content || !post) {
      alert('タイトルと内容は必須です');
      return;
    }

    try {
      // Markdownをそのまま保存
      await updateBlogPost(post.id, { ...formData, content: formData.content || '' });
      router.push('/blogs');
    } catch (error) {
      console.error('ブログ記事の更新に失敗しました:', error);
      alert('ブログ記事の更新に失敗しました');
    }
  };

  if (!post) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-64">
          <p>読み込み中...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ブログ記事編集</h1>
            <p className="mt-2 text-gray-600">Zennエディタでリッチな記事を編集しましょう</p>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            戻る
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* メインコンテンツ */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">記事内容</h2>
                <div className="space-y-4">
                <div>
                  <Label htmlFor="title">タイトル *</Label>
                  <Input
                    id="title"
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="ブログ記事のタイトル"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="slug">スラッグ *</Label>
                  <Input
                    id="slug"
                    type="text"
                    value={formData.slug || ''}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    placeholder="url-slug"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="excerpt">要約</Label>
                  <textarea
                    id="excerpt"
                    value={formData.excerpt || ''}
                    onChange={(e) => handleInputChange('excerpt', e.target.value)}
                    placeholder="記事の要約文"
                    className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <Label htmlFor="content" className="mb-4 block">内容 *</Label>
                  
                  <ZennEditor
                    value={formData.content || ''}
                    onChange={(value) => handleInputChange('content', value)}
                    placeholder="記事の内容をMarkdown形式で入力してください..."
                  />
                </div>
              </div>
            </Card>
            </div>

            {/* サイドバー */}
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">記事設定</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="status">ステータス</Label>
                    <select
                      id="status"
                      value={formData.status || 'DRAFT'}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="DRAFT">下書き</option>
                      <option value="PUBLISHED">公開</option>
                      <option value="ARCHIVED">アーカイブ</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="coverImage">カバー画像URL</Label>
                    <Input
                      id="coverImage"
                      type="url"
                      value={formData.coverImageUrl || ''}
                      onChange={(e) => handleInputChange('coverImageUrl', e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="text-sm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="tags">タグ</Label>
                    <div className="flex gap-2">
                      <Input
                        id="tags"
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        placeholder="タグを入力"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        className="text-sm"
                      />
                      <Button type="button" variant="outline" size="sm" onClick={addTag}>
                        追加
                      </Button>
                    </div>
                    {(formData.tags || []).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(formData.tags || []).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded flex items-center gap-1"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">SEO設定</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="seoTitle">SEOタイトル</Label>
                    <Input
                      id="seoTitle"
                      type="text"
                      value={formData.seoTitle || ''}
                      onChange={(e) => handleInputChange('seoTitle', e.target.value)}
                      placeholder="検索エンジン用タイトル"
                      className="text-sm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="seoDescription">SEO説明</Label>
                    <textarea
                      id="seoDescription"
                      value={formData.seoDescription || ''}
                      onChange={(e) => handleInputChange('seoDescription', e.target.value)}
                      placeholder="検索エンジン用説明文"
                      className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>
              </Card>

              {/* 操作ボタン */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">操作</h3>
                <div className="flex flex-col gap-3">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? '更新中...' : '更新'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => router.back()}
                    disabled={loading}
                  >
                    キャンセル
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}