import { Head, Link, useForm } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Pencil, Trash2 } from 'lucide-react';

export default function AdminUploadArticle() {
  const { data, setData, post, processing, errors } = useForm({
    title: '',
    category_id: '',
    keyword: '',
    content: '',
  });

  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [customCategory, setCustomCategory] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Fetch all categories from backend
  useEffect(() => {
    axios
      .get('/admin/article-categories')
      .then((res) => setCategories(res.data))
      .catch((err) => console.error('Failed to fetch categories:', err))
      .finally(() => setIsLoading(false));
  }, []);

  // Add new category
  const handleAddCategory = () => {
    const trimmed = customCategory.trim();
    if (!trimmed) return;

    axios
      .post('/admin/article-categories', { name: trimmed })
      .then((res) => {
        setCategories((prev) => [...prev, res.data]);
        setData('category_id', String(res.data.id));
        setCustomCategory('');
        setIsAdding(false);
      })
      .catch((err) => console.error('Failed to add category:', err));
  };

  // Update existing category
  const handleUpdateCategory = () => {
    if (editingIndex === null) return;
    const trimmed = customCategory.trim();
    if (!trimmed) return;

    const categoryToUpdate = categories[editingIndex];

    axios
      .put(`/admin/article-categories/${categoryToUpdate.id}`, { name: trimmed })
      .then((res) => {
        const updatedList = [...categories];
        updatedList[editingIndex] = res.data;
        setCategories(updatedList);
        setData('category_id', String(res.data.id));
        setCustomCategory('');
        setIsAdding(false);
        setEditingIndex(null);
      })
      .catch((err) => console.error('Failed to update category:', err));
  };

  // Delete category
  const handleDeleteCategory = (index: number) => {
    const categoryToDelete = categories[index];

    axios
      .delete(`/admin/article-categories/${categoryToDelete.id}`)
      .then(() => {
        const updated = categories.filter((_, i) => i !== index);
        setCategories(updated);
        if (data.category_id === String(categoryToDelete.id)) setData('category_id', '');
      })
      .catch((err) => console.error('Failed to delete category:', err));
  };

  // Submit article
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/admin/articles/store');
  };

  return (
    <>
      <Head title="Upload Article" />
      <div className="p-6 max-w-3xl mx-auto space-y-6 bg-white min-h-screen">
        <h1 className="text-2xl font-bold text-gray-900">Upload New Article</h1>

        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-200 bg-white">
            <CardTitle className="text-lg font-semibold text-gray-900">Article Information</CardTitle>
          </CardHeader>

          <CardContent className="bg-white p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <Input
                  type="text"
                  value={data.title}
                  onChange={(e) => setData('title', e.target.value)}
                  placeholder="Enter article title"
                  className="border-gray-300 focus:border-[#992426] focus:ring-[#992426] text-gray-700"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              {/* Category Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>

                {isLoading ? (
                  <p className="text-sm text-gray-500">Loading categories...</p>
                ) : (
                  <Select
                    onValueChange={(value) => {
                      if (value === 'Other') {
                        setIsAdding(true);
                        setData('category_id', '');
                      } else {
                        setIsAdding(false);
                        setData('category_id', value);
                        setEditingIndex(null);
                        setCustomCategory('');
                      }
                    }}
                    value={data.category_id}
                  >
                    <SelectTrigger className="w-full border-gray-300 focus:border-[#992426] focus:ring-[#992426] text-gray-700">
                      <SelectValue placeholder="Select or add category" />
                    </SelectTrigger>

                    <SelectContent className="bg-white border-gray-300">
                      {categories.map((category, index) => (
                        <SelectItem key={category.id} value={String(category.id)} className="text-gray-700 focus:bg-gray-100">
                          <div className="flex items-center justify-between w-full">
                            <span className="truncate">{category.name}</span>
                            {/* Show edit/delete buttons only for categories with ID > 5 */}
                            {category.id > 5 && (
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onPointerDown={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    setCustomCategory(category.name);
                                    setEditingIndex(index);
                                    setIsAdding(true);
                                  }}
                                  className="p-1 rounded hover:bg-gray-100 text-gray-600"
                                >
                                  <Pencil size={14} />
                                </button>

                                <button
                                  type="button"
                                  onPointerDown={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    handleDeleteCategory(index);
                                  }}
                                  className="p-1 rounded hover:bg-gray-100 text-gray-600"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            )}
                          </div>
                        </SelectItem>
                      ))}

                      <SelectItem value="Other" className="text-gray-700 focus:bg-gray-100">Other</SelectItem>
                    </SelectContent>
                  </Select>
                )}

                {/* Add/Edit new category input */}
                {isAdding && (
                  <div className="mt-3 flex gap-2">
                    <Input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Enter new category"
                      className="border-gray-300 focus:border-[#992426] focus:ring-[#992426] text-gray-700"
                    />
                    <Button
                      type="button"
                      onClick={editingIndex !== null ? handleUpdateCategory : handleAddCategory}
                      className="bg-[#770000] hover:bg-[#992426] text-white"
                    >
                      {editingIndex !== null ? 'Update' : 'Add'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsAdding(false);
                        setCustomCategory('');
                        setEditingIndex(null);
                      }}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </Button>
                  </div>
                )}

                {errors.category_id && <p className="text-red-500 text-sm mt-1">{errors.category_id}</p>}
              </div>

              {/* Keyword */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Keywords</label>
                <Input
                  type="text"
                  value={data.keyword}
                  onChange={(e) => setData('keyword', e.target.value)}
                  placeholder="Enter keywords separated by commas"
                  className="border-gray-300 focus:border-[#992426] focus:ring-[#992426] text-gray-700"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <textarea
                  value={data.content}
                  onChange={(e) => setData('content', e.target.value)}
                  placeholder="Write your article here..."
                  rows={8}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-700 focus:outline-none focus:border-[#992426] focus:ring-1 focus:ring-[#992426] resize-none"
                />
                {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content}</p>}
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Link href="/admin/admin_articles">
                  <Button 
                    variant="outline" 
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  disabled={processing}
                  className="bg-[#770000] hover:bg-[#992426] text-white"
                >
                  {processing ? 'Uploading...' : 'Submit Article'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}