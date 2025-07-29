'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useMonologueManagement, Monologue, UpdateMonologueInput } from '@/hooks/useContentManagement';

export default function EditMonologuePage() {
  const router = useRouter();
  const params = useParams();
  const { fetchMonologue, updateMonologue, loading } = useMonologueManagement();
  
  const [monologue, setMonologue] = useState<Monologue | null>(null);
  const [formData, setFormData] = useState<UpdateMonologueInput>({});
  const [tagInput, setTagInput] = useState('');

  const loadMonologue = useCallback(async (id: string) => {
    try {
      const result = await fetchMonologue(id) as { monologue: Monologue } | null;
      if (result?.monologue) {
        setMonologue(result.monologue);
        setFormData({
          content: result.monologue.content,
          contentType: result.monologue.contentType,
          codeLanguage: result.monologue.codeLanguage || '',
          codeSnippet: result.monologue.codeSnippet || '',
          tags: result.monologue.tags || [],
          isPublished: result.monologue.isPublished,
          url: result.monologue.url || '',
          series: result.monologue.series || '',
          category: result.monologue.category || '',
        });
      }
    } catch (error) {
      console.error('モノローグの読み込みに失敗しました:', error);
    }
  }, [fetchMonologue]);

  useEffect(() => {
    if (params.id) {
      loadMonologue(params.id as string);
    }
  }, [params.id, loadMonologue]);

  const handleInputChange = (field: keyof UpdateMonologueInput, value: string | boolean | string[]) => {
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
    
    if (!formData.content || !monologue) {
      alert('内容は必須です');
      return;
    }

    try {
      await updateMonologue(monologue.id, formData);
      router.push('/monologues');
    } catch (error) {
      console.error('モノローグの更新に失敗しました:', error);
      alert('モノローグの更新に失敗しました');
    }
  };

  if (!monologue) {
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
          <h1 className="text-2xl font-bold text-gray-900">モノローグ編集</h1>
          <Button variant="outline" onClick={() => router.back()}>
            戻る
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="contentType">コンテンツタイプ</Label>
                  <select
                    id="contentType"
                    value={formData.contentType || 'POST'}
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
                    value={formData.content || ''}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    placeholder="モノローグの内容"
                    className="w-full min-h-[200px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {formData.contentType === 'CODE' && (
                  <>
                    <div>
                      <Label htmlFor="codeLanguage">プログラミング言語</Label>
                      <Input
                        id="codeLanguage"
                        type="text"
                        value={formData.codeLanguage || ''}
                        onChange={(e) => handleInputChange('codeLanguage', e.target.value)}
                        placeholder="JavaScript, Python, etc."
                      />
                    </div>

                    <div>
                      <Label htmlFor="codeSnippet">コードスニペット</Label>
                      <textarea
                        id="codeSnippet"
                        value={formData.codeSnippet || ''}
                        onChange={(e) => handleInputChange('codeSnippet', e.target.value)}
                        placeholder="コードスニペット"
                        className="w-full min-h-[150px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                    </div>

                  </>
                )}


                <div>
                  <Label>公開状態</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="isPublished"
                        checked={!formData.isPublished}
                        onChange={() => handleInputChange('isPublished', false)}
                        className="mr-2"
                      />
                      下書き
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="isPublished"
                        checked={formData.isPublished}
                        onChange={() => handleInputChange('isPublished', true)}
                        className="mr-2"
                      />
                      公開
                    </label>
                  </div>
                </div>
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

                <div>
                  <Label htmlFor="series">シリーズ</Label>
                  <Input
                    id="series"
                    type="text"
                    value={formData.series || ''}
                    onChange={(e) => handleInputChange('series', e.target.value)}
                    placeholder="シリーズ名"
                  />
                </div>

                <div>
                  <Label htmlFor="category">カテゴリ</Label>
                  <Input
                    id="category"
                    type="text"
                    value={formData.category || ''}
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