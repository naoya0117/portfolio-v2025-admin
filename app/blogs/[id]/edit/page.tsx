'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useBlogManagement, BlogPost, UpdateBlogPostInput } from '@/hooks/useContentManagement';

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const { fetchBlogPost, updateBlogPost, loading } = useBlogManagement();
  
  const [post, setPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState<UpdateBlogPostInput>({});
  const [tagInput, setTagInput] = useState('');

  const loadBlogPost = useCallback(async (slug: string) => {
    try {
      const result = await fetchBlogPost(slug);
      if (result?.blogPost) {
        setPost(result.blogPost);
        setFormData({
          title: result.blogPost.title,
          slug: result.blogPost.slug,
          excerpt: result.blogPost.excerpt || '',
          content: result.blogPost.content,
          coverImageUrl: result.blogPost.coverImageUrl || '',
          tags: result.blogPost.tags || [],
          status: result.blogPost.status,
          seoTitle: result.blogPost.seoTitle || '',
          seoDescription: result.blogPost.seoDescription || '',
        });
      }
    } catch (error) {
      console.error('ブログ記事の読み込みに失敗しました:', error);
    }
  }, [fetchBlogPost]);

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
      await updateBlogPost(post.id, formData);
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
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">ブログ記事編集</h1>
          <Button variant="outline" onClick={() => router.back()}>
            戻る
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <Card className="p-6">
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
                  <Label htmlFor="content">内容 *</Label>
                  <textarea
                    id="content"
                    value={formData.content || ''}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    placeholder="記事の内容（Markdown形式）"
                    className="w-full min-h-[300px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="status">ステータス</Label>
                  <select
                    id="status"
                    value={formData.status || 'DRAFT'}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    />
                    <Button type="button" variant="outline" onClick={addTag}>
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
              <div className="space-y-4">
                <h3 className="text-lg font-medium">SEO設定</h3>
                
                <div>
                  <Label htmlFor="seoTitle">SEOタイトル</Label>
                  <Input
                    id="seoTitle"
                    type="text"
                    value={formData.seoTitle || ''}
                    onChange={(e) => handleInputChange('seoTitle', e.target.value)}
                    placeholder="検索エンジン用タイトル"
                  />
                </div>

                <div>
                  <Label htmlFor="seoDescription">SEO説明</Label>
                  <textarea
                    id="seoDescription"
                    value={formData.seoDescription || ''}
                    onChange={(e) => handleInputChange('seoDescription', e.target.value)}
                    placeholder="検索エンジン用説明文"
                    className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </Card>

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                キャンセル
              </Button>
              <Button
                type="submit"
                disabled={loading}
              >
                {loading ? '更新中...' : '更新'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}