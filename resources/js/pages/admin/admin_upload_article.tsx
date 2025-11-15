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
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold">Upload New Article</h1>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Article Information</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <Input
                  type="text"
                  value={data.title}
                  onChange={(e) => setData('title', e.target.value)}
                  placeholder="Enter article title"
                />
                {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
              </div>

              {/* Category Dropdown */}
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>

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
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select or add category" />
                    </SelectTrigger>

                    <SelectContent>
                      {categories.map((category, index) => (
                        <SelectItem key={category.id} value={String(category.id)}>
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
                                  className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700"
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
                                  className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            )}
                          </div>
                        </SelectItem>
                      ))}

                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                )}

                {/* Add/Edit new category input */}
                {isAdding && (
                  <div className="mt-2 flex gap-2">
                    <Input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Enter new category"
                    />
                    <Button
                      type="button"
                      onClick={editingIndex !== null ? handleUpdateCategory : handleAddCategory}
                    >
                      {editingIndex !== null ? 'Update' : 'Add'}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setIsAdding(false);
                        setCustomCategory('');
                        setEditingIndex(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}

                {errors.category_id && <p className="text-red-500 text-sm">{errors.category_id}</p>}
              </div>

              {/* Keyword */}
              <div>
                <label className="block text-sm font-medium mb-1">Keywords</label>
                <Input
                  type="text"
                  value={data.keyword}
                  onChange={(e) => setData('keyword', e.target.value)}
                  placeholder="Enter keywords separated by commas"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium mb-1">Content</label>
                <textarea
                  value={data.content}
                  onChange={(e) => setData('content', e.target.value)}
                  placeholder="Write your article here..."
                  rows={8}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.content && <p className="text-red-500 text-sm">{errors.content}</p>}
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-4 mt-4">
                <Link href="/admin/admin_articles">
                  <Button variant="secondary">Cancel</Button>
                </Link>
                <Button type="submit" disabled={processing}>
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