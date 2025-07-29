'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useMonologueManagement, CreateMonologueInput } from '@/hooks/useContentManagement';

export default function NewMonologuePage() {
  const router = useRouter();
  const { createMonologue, loading } = useMonologueManagement();
  
  const [formData, setFormData] = useState<CreateMonologueInput>({
    content: '',
    contentType: 'POST' as const,
    codeLanguage: '',
    codeSnippet: '',
    tags: [],
    isPublished: false,
    url: '',
    series: '',
    category: '',
  });
  
  const [tagInput, setTagInput] = useState('');

  const handleInputChange = (field: keyof CreateMonologueInput, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
    
    if (!formData.content.trim()) {
      newErrors.content = '内容は必須です';
    } else if (formData.content.length < 5) {
      newErrors.content = '内容は5文字以上で入力してください';
    }
    
    if (formData.contentType === 'CODE') {
      if (formData.codeSnippet && formData.codeSnippet.length > 5000) {
        newErrors.codeSnippet = 'コードスニペットは5000文字以内で入力してください';
      }
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
      await createMonologue(formData);
      router.push('/monologues');
    } catch (error) {
      console.error('モノローグの作成に失敗しました:', error);
      setErrors({ general: 'モノローグの作成に失敗しました。もう一度お試しください。' });
    }
  };

  const handleSaveAndPublish = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await createMonologue({ ...formData, isPublished: true });
      router.push('/monologues');
    } catch (error) {
      console.error('モノローグの公開に失敗しました:', error);
      setErrors({ general: 'モノローグの公開に失敗しました。もう一度お試しください。' });
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">新規モノローグ</h1>
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
                  <Label htmlFor="contentType">コンテンツタイプ</Label>
                  <select
                    id="contentType"
                    value={formData.contentType}
                    onChange={(e) => handleInputChange('contentType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="POST">投稿</option>
                    <option value="CODE">コード</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="content">内容 *</Label>
                  <textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    placeholder="モノローグの内容"
                    className={`w-full min-h-[200px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.content ? 'border-red-500' : ''}`}
                    required
                  />
                  {errors.content && (
                    <p className="mt-1 text-sm text-red-600">{errors.content}</p>
                  )}
                </div>

                {formData.contentType === 'CODE' && (
                  <>
                    <div>
                      <Label htmlFor="codeLanguage">プログラミング言語</Label>
                      <Input
                        id="codeLanguage"
                        type="text"
                        value={formData.codeLanguage}
                        onChange={(e) => handleInputChange('codeLanguage', e.target.value)}
                        placeholder="JavaScript, Python, etc."
                      />
                    </div>

                    <div>
                      <Label htmlFor="codeSnippet">コードスニペット</Label>
                      <textarea
                        id="codeSnippet"
                        value={formData.codeSnippet}
                        onChange={(e) => handleInputChange('codeSnippet', e.target.value)}
                        placeholder="コードスニペット"
                        className={`w-full min-h-[150px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono ${errors.codeSnippet ? 'border-red-500' : ''}`}
                      />
                      {errors.codeSnippet && (
                        <p className="mt-1 text-sm text-red-600">{errors.codeSnippet}</p>
                      )}
                    </div>

                  </>
                )}

              </div>
            </Card>

            <Card className="p-6">
              <div className="space-y-4">
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

                <div>
                  <Label htmlFor="series">シリーズ</Label>
                  <Input
                    id="series"
                    type="text"
                    value={formData.series}
                    onChange={(e) => handleInputChange('series', e.target.value)}
                    placeholder="シリーズ名"
                  />
                </div>

                <div>
                  <Label htmlFor="category">カテゴリ</Label>
                  <Input
                    id="category"
                    type="text"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    placeholder="カテゴリ名"
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