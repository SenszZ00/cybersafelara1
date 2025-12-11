import { useEffect, useMemo, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Filter, X } from 'lucide-react';

type Option = { id?: number; name: string };

type Props = {
  statuses?: Option[];
  categories?: Option[];
  className?: string;
};

export default function ArticleFilter({ statuses = [], categories = [], className = '' }: Props) {
  const page = usePage();
  const currentPath = page.url.split('?')[0];
 
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');

  // hydrate from URL on mount / path change
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setDate(params.get('date') || '');
    setStatus(params.get('status') || '');
    setCategory(params.get('category') || '');
  }, [currentPath]);

  const statusOptions = useMemo(
    () => statuses.map((s) => ({ value: s.name, label: s.name })),
    [statuses],
  );
  const categoryOptions = useMemo(
    () => categories.map((c) => ({ value: c.name, label: c.name })),
    [categories],
  );

  const applyFilters = (next: { date?: string; status?: string; category?: string }) => {
    const params = new URLSearchParams(window.location.search);
    next.date ? params.set('date', next.date) : params.delete('date');
    next.status ? params.set('status', next.status) : params.delete('status');
    next.category ? params.set('category', next.category) : params.delete('category');
    params.delete('page'); // reset pagination on filter change
    const qs = params.toString();
    router.get(qs ? `${currentPath}?${qs}` : currentPath, {}, { preserveScroll: true, preserveState: true });
  };

  const clearAll = () => applyFilters({ date: '', status: '', category: '' });

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
        <Filter className="h-4 w-4" />
        Filters
      </div>

      <input
        type="date"
        value={date}
        onChange={(e) => {
          setDate(e.target.value);
          applyFilters({ date: e.target.value, status, category });
        }}
        className="h-9 rounded-md border border-gray-300 px-3 text-sm focus:border-[#770000] focus:ring-[#770000]"
      />

      <select
        value={status}
        onChange={(e) => {
          setStatus(e.target.value);
          applyFilters({ date, status: e.target.value, category });
        }}
        className="h-9 rounded-md border border-gray-300 px-3 text-sm focus:border-[#770000] focus:ring-[#770000] min-w-[150px]"
      >
        <option value="">Status (all)</option>
        {statusOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <select
        value={category}
        onChange={(e) => {
          setCategory(e.target.value);
          applyFilters({ date, status, category: e.target.value });
        }}
        className="h-9 rounded-md border border-gray-300 px-3 text-sm focus:border-[#770000] focus:ring-[#770000] min-w-[150px]"
      >
        <option value="">Category (all)</option>
        {categoryOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {(date || status || category) && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
        >
          <X className="h-4 w-4" />
          Clear
        </button>
      )}
    </div>
  );
}