import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'My Reports', href: '/my-reports' },
  { title: 'Submit Report', href: '/user/user_submit_report' },
];

const DEFAULT_CATEGORIES = [
  'Phishing',
  'Malware',
  'Password Security', 
  'Data Privacy',
  'Social Engineering',
  'Unauthorized Access',
];

export default function UserSubmitReport() {
  const { data, setData, post, processing, errors, reset } = useForm({
    title: '',
    category_id: '',
    date: '',
    description: '',
    is_anonymous: false,
    evidence: null as File | null,
  });

  const [categories, setCategories] = useState<{ id: number | string; name: string }[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [customCategory, setCustomCategory] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    console.log('Loading categories...');
    
    const defaultCategories = DEFAULT_CATEGORIES.map(name => ({ 
      id: `local:${name}`, 
      name 
    }));
    
    setCategories(defaultCategories);
    setLoadingCats(false);
    
    axios.get('/user/incident_categories')
      .then(res => {
        console.log('API Response:', res.data);
        if (res.data && Array.isArray(res.data)) {
          const fetched = res.data;
          setCategories(fetched);
        }
      })
      .catch(err => {
        console.error('Failed to fetch categories:', err);
        setCategories(defaultCategories);
      })
      .finally(() => {
        setLoadingCats(false);
      });
  
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setData('evidence', file);
  };

  const handleAddCategory = async () => {
    const name = customCategory.trim();
    if (!name) return;

    const existing = categories.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      setData('category_id', String(existing.id));
      setCustomCategory('');
      setIsAdding(false);
      return;
    }

    setAdding(true);
    try {
      const newCategory = { id: `local:${name}`, name };
      setCategories(prev => [...prev, newCategory]);
      setData('category_id', String(newCategory.id));
      setCustomCategory('');
      setIsAdding(false);
    } catch (err) {
      console.error('Failed to add category', err);
    } finally {
      setAdding(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    post('/user/reports/store', {
      forceFormData: true,
      onSuccess: () => { reset(); },
      onError: () => { console.log('Validation errors', errors); },
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Submit Report" />

      {/* Changed from max-w-4xl to max-w-5xl for wider card */}
      <div className="p-4 max-w-20xl mx-auto space-y-3 bg-white min-h-screen">
        <h1 className="text-2xl font-bold text-gray-900">Report a Cybersecurity Incident</h1>

        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-200 bg-white py-6">
            <CardTitle className="text-xl font-semibold text-gray-900">Incident Information</CardTitle>
          </CardHeader>

          <CardContent className="bg-white p-8">
            {/* Anonymous Toggle */}
            <div className="flex items-center justify-between mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Post Anonymously</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={data.is_anonymous}
                onClick={() => setData('is_anonymous', !data.is_anonymous)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#992426] focus:ring-offset-2 ${
                  data.is_anonymous ? 'bg-[#770000]' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    data.is_anonymous ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Title</label>
                <Input
                  type="text"
                  value={data.title}
                  onChange={(e) => setData('title', e.target.value)}
                  placeholder="Enter report title"
                  className="border-gray-300 focus:border-[#992426] focus:ring-[#992426] text-gray-700 h-12 text-base"
                />
                {errors.title && <p className="text-red-500 text-sm mt-2">{(errors as any).title}</p>}
              </div>

              {/* Type of Incident */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Type of Incident</label>

                {loadingCats ? (
                  <p className="text-sm text-gray-500">Loading categories...</p>
                ) : (
                  <>
                    <Select
                      onValueChange={(value) => {
                        console.log('Selected value:', value);
                        if (value === 'other') {
                          setIsAdding(true);
                          setData('category_id', '');
                        } else {
                          setIsAdding(false);
                          setData('category_id', value);
                        }
                      }}
                      value={data.category_id}
                    >
                      <SelectTrigger className="w-full border-gray-300 focus:border-[#992426] focus:ring-[#992426] text-gray-700 h-12 text-base">
                        <SelectValue placeholder="Select an incident type" />
                      </SelectTrigger>

                      <SelectContent className="bg-white border-gray-300">
                        {categories.map((category) => (
                          <SelectItem key={String(category.id)} value={String(category.id)} className="text-gray-700 focus:bg-gray-100 text-base">
                            {category.name}
                          </SelectItem>
                        ))}
                        <SelectItem value="other" className="text-gray-700 focus:bg-gray-100 text-base">Other</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Add custom category box */}
                    {isAdding && (
                      <div className="mt-4 flex gap-3">
                        <Input
                          type="text"
                          value={customCategory}
                          onChange={(e) => setCustomCategory(e.target.value)}
                          placeholder="Enter new category"
                          className="border-gray-300 focus:border-[#992426] focus:ring-[#992426] text-gray-700 h-12 text-base"
                        />
                        <Button 
                          type="button" 
                          onClick={handleAddCategory}
                          className="bg-[#770000] hover:bg-[#992426] text-white h-12 px-6"
                        >
                          {adding ? 'Adding...' : 'Add'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsAdding(false);
                            setCustomCategory('');
                          }}
                          className="border-gray-300 text-gray-700 hover:bg-gray-50 h-12 px-6"
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </>
                )}

                {errors.category_id && <p className="text-red-500 text-sm mt-2">{(errors as any).category_id}</p>}
              </div>

              {/* Date of Incident */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Date of Incident</label>
                <Input
                  type="date"
                  value={data.date}
                  onChange={(e) => setData('date', e.target.value)}
                  className="border-gray-300 focus:border-[#992426] focus:ring-[#992426] text-gray-700 h-12 text-base"
                />
                {errors.date && <p className="text-red-500 text-sm mt-2">{(errors as any).date}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Description</label>
                <textarea
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  placeholder="Please provide detailed information about the incident..."
                  rows={8}
                  className="w-full border border-gray-300 rounded-lg p-4 text-base text-gray-700 focus:outline-none focus:border-[#992426] focus:ring-1 focus:ring-[#992426] resize-none"
                />
                {errors.description && <p className="text-red-500 text-sm mt-2">{(errors as any).description}</p>}
              </div>

              {/* Upload Evidence */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Upload Evidence (Screenshots, Files, etc.)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <input type="file" id="evidence" onChange={handleFileChange} className="hidden" accept=".jpg,.jpeg,.png,.pdf,.doc,.docx" />
                    <label htmlFor="evidence" className="cursor-pointer">
                      <span className="font-medium text-[#770000] hover:text-[#992426] hover:underline text-base">Choose Files</span>
                    </label>
                    <span className="text-gray-500 text-sm">{data.evidence ? data.evidence.name : 'No file chosen'}</span>
                    <p className="text-xs text-gray-500 mt-1">Upload screenshots, documents, or other evidence files</p>
                  </div>
                </div>
                {errors.evidence && <p className="text-red-500 text-sm mt-2">{(errors as any).evidence}</p>}
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                <Link href="/my_reports">
                  <Button 
                    variant="outline" 
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 h-12 px-8 text-base"
                  >
                    Cancel
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  disabled={processing}
                  className="bg-[#770000] hover:bg-[#992426] text-white h-12 px-8 text-base"
                >
                  {processing ? 'Submitting...' : 'Submit Report'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}