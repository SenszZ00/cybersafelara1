import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useState } from 'react';

interface PageProps {
  categories: { id: number; name: string }[];
}

export default function UserSubmitReport({ categories }: PageProps) {
  const [categoryId, setCategoryId] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [evidence, setEvidence] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setEvidence(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    const formData = new FormData();
    formData.append('category_id', categoryId);
    formData.append('incident_date', incidentDate);
    formData.append('description', description);
    formData.append('is_anonymous', isAnonymous ? '1' : '0');
    
    if (evidence) {
      formData.append('evidence', evidence);
    }

    await router.post('/user/reports/store', formData, {
      forceFormData: true,
      onSuccess: () => {
        setCategoryId('');
        setIncidentDate('');
        setDescription('');
        setIsAnonymous(false);
        setEvidence(null);
        setProcessing(false);
      },
      onError: () => {
        setProcessing(false);
      },
    });
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <>
      <Head title="Submit Report" />
      <div className="p-6 max-w-4xl mx-auto space-y-6 bg-white min-h-screen">
        <h1 className="text-2xl font-bold text-gray-900">Submit New Report</h1>

        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-200 bg-white">
            <CardTitle className="text-lg font-semibold text-gray-900">Report Information</CardTitle>
          </CardHeader>

          <CardContent className="bg-white p-6">
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Submit Anonymously</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Your identity will be hidden, but this may affect automatic assignment of IT personnel.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isAnonymous}
                  onClick={() => setIsAnonymous(!isAnonymous)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#992426] focus:ring-offset-2 ${
                    isAnonymous ? 'bg-[#770000]' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isAnonymous ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <Select
                  onValueChange={setCategoryId}
                  value={categoryId}
                  required
                >
                  <SelectTrigger className="w-full border-gray-300 focus:border-[#992426] focus:ring-[#992426] text-gray-700">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-300">
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)} className="text-gray-700 focus:bg-gray-100">
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Incident Date <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={incidentDate}
                  onChange={(e) => setIncidentDate(e.target.value)}
                  className="border-gray-300 focus:border-[#992426] focus:ring-[#992426] text-gray-700"
                  max={today}
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Select the date when the incident occurred
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide detailed information about the incident..."
                  rows={8}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-700 focus:outline-none focus:border-[#992426] focus:ring-1 focus:ring-[#992426] resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Evidence (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <input 
                      type="file" 
                      id="evidence" 
                      onChange={handleFileChange} 
                      className="hidden" 
                      accept=".jpg,.jpeg,.png,.pdf,.doc,.docx" 
                    />
                    <div className="flex flex-col items-center gap-2">
                      <label htmlFor="evidence" className="cursor-pointer">
                        <span className="font-medium text-[#770000] hover:text-[#992426] hover:underline">
                          Choose File
                        </span>
                      </label>
                      <span className="text-sm text-gray-500">
                        {evidence ? evidence.name : 'No file chosen'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Supported formats: JPG, PNG, PDF, DOC, DOCX (Max 10MB)
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Link href="/my_reports">
                  <Button 
                    variant="outline" 
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    type="button"
                  >
                    Cancel
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  disabled={processing}
                  className="bg-[#770000] hover:bg-[#992426] text-white"
                >
                  {processing ? 'Submitting...' : 'Submit Report'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

      </div>
    </>
  );
}