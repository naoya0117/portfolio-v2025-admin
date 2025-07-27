'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useBlogManagement, CreateBlogPostInput } from '@/hooks/useContentManagement';

export default function NewBlogPage() {
  const router = useRouter();
  const { createBlogPost, loading } = useBlogManagement();
  
  const [formData, setFormData] = useState<CreateBlogPostInput>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    coverImageUrl: '',
    tags: [],
    status: 'DRAFT',
    seoTitle: '',
    seoDescription: '',
  });
  
  const [tagInput, setTagInput] = useState('');

  const handleInputChange = (field: keyof CreateBlogPostInput, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate slug from title
    if (field === 'title') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'タイトルは必須です';
    } else if (formData.title.length > 200) {
      newErrors.title = 'タイトルは200文字以内で入力してください';
    }
    
    if (!formData.slug.trim()) {
      newErrors.slug = 'スラッグは必須です';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'スラッグは英小文字、数字、ハイフンのみ使用できます';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = '内容は必須です';
    } else if (formData.content.length < 10) {
      newErrors.content = '内容は10文字以上で入力してください';
    }
    
    if (formData.excerpt && formData.excerpt.length > 300) {
      newErrors.excerpt = '要約は300文字以内で入力してください';
    }
    
    if (formData.seoTitle && formData.seoTitle.length > 60) {
      newErrors.seoTitle = 'SEOタイトルは60文字以内で入力してください';
    }
    
    if (formData.seoDescription && formData.seoDescription.length > 160) {
      newErrors.seoDescription = 'SEO説明は160文字以内で入力してください';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await createBlogPost(formData);
      router.push('/blogs');
    } catch (error) {
      console.error('ブログ記事の作成に失敗しました:', error);
      setErrors({ general: 'ブログ記事の作成に失敗しました。もう一度お試しください。' });
    }
  };

  const handleSaveAndPublish = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await createBlogPost({ ...formData, status: 'PUBLISHED' });
      router.push('/blogs');
    } catch (error) {
      console.error('ブログ記事の公開に失敗しました:', error);
      setErrors({ general: 'ブログ記事の公開に失敗しました。もう一度お試しください。' });
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">新規ブログ記事</h1>
          <Button variant="outline" onClick={() => router.back()}>
            戻る
          </Button>
        </div>

        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{errors.general}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">タイトル *</Label>
                  <Input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="ブログ記事のタイトル"
                    className={errors.title ? 'border-red-500' : ''}
                    required
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="slug">スラッグ *</Label>
                  <Input
                    id="slug"
                    type="text"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    placeholder="url-slug"
                    className={errors.slug ? 'border-red-500' : ''}
                    required
                  />
                  {errors.slug && (
                    <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="excerpt">要約</Label>
                  <textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => handleInputChange('excerpt', e.target.value)}
                    placeholder="記事の要約文"
                    className={`w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.excerpt ? 'border-red-500' : ''}`}
                  />
                  {errors.excerpt && (
                    <p className="mt-1 text-sm text-red-600">{errors.excerpt}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="content">内容 *</Label>
                  <textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    placeholder="記事の内容（Markdown形式）"
                    className={`w-full min-h-[300px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.content ? 'border-red-500' : ''}`}
                    required
                  />
                  {errors.content && (
                    <p className="mt-1 text-sm text-red-600">{errors.content}</p>
                  )}
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="coverImage">カバー画像URL</Label>
                  <Input
                    id="coverImage"
                    type="url"
                    value={formData.coverImageUrl}
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
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {formData.tags.map((tag) => (
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
                    value={formData.seoTitle}
                    onChange={(e) => handleInputChange('seoTitle', e.target.value)}
                    placeholder="検索エンジン用タイトル"
                    className={errors.seoTitle ? 'border-red-500' : ''}
                  />
                  {errors.seoTitle && (
                    <p className="mt-1 text-sm text-red-600">{errors.seoTitle}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="seoDescription">SEO説明</Label>
                  <textarea
                    id="seoDescription"
                    value={formData.seoDescription}
                    onChange={(e) => handleInputChange('seoDescription', e.target.value)}
                    placeholder="検索エンジン用説明文"
                    className={`w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.seoDescription ? 'border-red-500' : ''}`}
                  />
                  {errors.seoDescription && (
                    <p className="mt-1 text-sm text-red-600">{errors.seoDescription}</p>
                  )}
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
                variant="outline"
                disabled={loading}
              >
                {loading ? '保存中...' : '下書き保存'}
              </Button>
              <Button
                type="button"
                onClick={handleSaveAndPublish}
                disabled={loading}
              >
                {loading ? '公開中...' : '公開'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}