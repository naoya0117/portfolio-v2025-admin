'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCodeCategoryManagement, CodeCategory, CreateCodeCategoryInput, UpdateCodeCategoryInput } from '@/hooks/useContentManagement';

export default function CategoriesPage() {
  const {
    categories,
    loading,
    error,
    fetchCodeCategories,
    createCodeCategory,
    updateCodeCategory,
    deleteCodeCategory,
  } = useCodeCategoryManagement();

  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CodeCategory | null>(null);
  const [formData, setFormData] = useState<CreateCodeCategoryInput>({
    name: '',
    slug: '',
    description: '',
    parentId: '',
    color: '',
    icon: '',
  });

  useEffect(() => {
    fetchCodeCategories();
  }, [fetchCodeCategories]);

  const handleInputChange = (field: keyof CreateCodeCategoryInput, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate slug from name
    if (field === 'name') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.slug) {
      alert('名前とスラッグは必須です');
      return;
    }

    try {
      if (editingCategory) {
        const updateData: UpdateCodeCategoryInput = {
          name: formData.name,
          slug: formData.slug,
          description: formData.description || undefined,
          parentId: formData.parentId || undefined,
          color: formData.color || undefined,
          icon: formData.icon || undefined,
        };
        await updateCodeCategory(editingCategory.id, updateData);
      } else {
        await createCodeCategory(formData);
      }
      
      resetForm();
      fetchCodeCategories();
    } catch (error) {
      console.error('カテゴリの保存に失敗しました:', error);
      alert('カテゴリの保存に失敗しました');
    }
  };

  const handleEdit = (category: CodeCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      parentId: category.parentId || '',
      color: category.color || '',
      icon: category.icon || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('本当に削除しますか？')) {
      await deleteCodeCategory(id);
      fetchCodeCategories();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      parentId: '',
      color: '',
      icon: '',
    });
    setEditingCategory(null);
    setShowForm(false);
  };

  const renderCategoryTree = (cats: CodeCategory[], level = 0) => {
    return cats.map((category) => (
      <div key={category.id}>
        <Card className={`p-4 hover:shadow-lg transition-shadow ${level > 0 ? 'ml-8 border-l-4 border-blue-200' : ''}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {category.icon && <span className="text-lg">{category.icon}</span>}
              <div>
                <h3 className="font-semibold text-gray-900">{category.name}</h3>
                <p className="text-sm text-gray-500">スラッグ: {category.slug}</p>
                {category.description && (
                  <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                )}
              </div>
              {category.color && (
                <div 
                  className="w-4 h-4 rounded-full border"
                  style={{ backgroundColor: category.color }}
                />
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(category)}
              >
                編集
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(category.id)}
                disabled={loading}
              >
                削除
              </Button>
            </div>
          </div>
        </Card>
        {category.children && category.children.length > 0 && (
          <div className="mt-2">
            {renderCategoryTree(category.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">カテゴリ管理</h1>
          <Button
            onClick={() => setShowForm(!showForm)}
            disabled={loading}
          >
            {showForm ? 'キャンセル' : '新規作成'}
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">エラー: {error}</p>
          </div>
        )}

        {showForm && (
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">
              {editingCategory ? 'カテゴリ編集' : 'カテゴリ作成'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">名前 *</Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="カテゴリ名"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="slug">スラッグ *</Label>
                    <Input
                      id="slug"
                      type="text"
                      value={formData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      placeholder="category-slug"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">説明</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="カテゴリの説明"
                    className="w-full min-h-[80px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="parentId">親カテゴリ</Label>
                    <select
                      id="parentId"
                      value={formData.parentId}
                      onChange={(e) => handleInputChange('parentId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">なし（トップレベル）</option>
                      {categories
                        .filter(cat => editingCategory ? cat.id !== editingCategory.id : true)
                        .map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="color">色</Label>
                    <div className="flex gap-2">
                      <Input
                        id="color"
                        type="color"
                        value={formData.color}
                        onChange={(e) => handleInputChange('color', e.target.value)}
                        className="w-16 h-10"
                      />
                      <Input
                        type="text"
                        value={formData.color}
                        onChange={(e) => handleInputChange('color', e.target.value)}
                        placeholder="#000000"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="icon">アイコン</Label>
                    <Input
                      id="icon"
                      type="text"
                      value={formData.icon}
                      onChange={(e) => handleInputChange('icon', e.target.value)}
                      placeholder="📁"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    キャンセル
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? '保存中...' : (editingCategory ? '更新' : '作成')}
                  </Button>
                </div>
              </div>
            </form>
          </Card>
        )}

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </Card>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500 mb-4">カテゴリがまだありません</p>
            <Button onClick={() => setShowForm(true)}>
              最初のカテゴリを作成
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {renderCategoryTree(categories.filter(cat => !cat.parentId))}
          </div>
        )}

        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">
            {categories.length}件のカテゴリ
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}