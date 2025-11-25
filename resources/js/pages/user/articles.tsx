import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Public Articles',
    href: '/articles',
  },
];

interface Article {
  article_id: number;
  title: string;
  content: string;
  keyword?: string;
  created_at: string;
  user?: {
    username: string;
  };
  category?: {
    name: string;
  };
}

interface ArticlesProps {
  articles: Article[];
  search?: string;
}

export default function Articles({ articles: initialArticles, search: initialSearch = '' }: ArticlesProps) {
  const [articles, setArticles] = useState<Article[]>(initialArticles || []);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>(initialArticles || []);
  const [hasSearched, setHasSearched] = useState(false);

  // Real-time filtering based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredArticles(articles);
      setHasSearched(false); // Reset when search is cleared
    } else {
      const filtered = articles.filter(article =>
        article.keyword?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredArticles(filtered);
      setHasSearched(true); // Set to true when searching
    }
  }, [searchTerm, articles]);

  // Update local state when props change
  useEffect(() => {
    setArticles(initialArticles || []);
    setSearchTerm(initialSearch);
    // Set hasSearched based on initial search term
    if (initialSearch.trim()) {
      setHasSearched(true);
    }
  }, [initialArticles, initialSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    // Only set hasSearched to true if there's actually a search term
    if (value.trim()) {
      setHasSearched(true);
    } else {
      setHasSearched(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    
    const words = name.split(' ').filter(word => word.length > 0);
    
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    } else {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Articles" />
      <div className="min-h-screen bg-white">
        
        {/* Header with Search */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="flex flex-col gap-4"> {/* Reduced gap to match admin_public_articles */}
              {/* Header */}
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Public Articles</h1>
                {/* Removed article count from header - moved below search bar */}
              </div>

              {/* Search Bar - No form or submit button needed */}
              <div className="relative max-w-md"> {/* Changed to match admin_public_articles layout */}
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search articles by keyword, title, or content..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-10 border-gray-300 focus:border-[#992426] focus:ring-[#992426] text-gray-700"
                />
              </div>

              {/* Article Count - Below search bar, only show when user has searched */}
              {hasSearched && (
                <div className="text-sm text-gray-500">
                  {filteredArticles.length} articles found
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Articles Section */}
        <div className="max-w-6xl mx-auto px-6 py-8">
          {filteredArticles.length > 0 ? (
            <div className="space-y-8">
              {filteredArticles.map((article) => (
                <article 
                  key={article.article_id}
                  className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 p-6"
                >
                  {/* Article Header */}
                  <div className="mb-4">
                    {article.keyword && (
                      <span className="inline-block bg-gray-100 text-[#992426] text-xs px-3 py-1 rounded-full mb-3">
                        {article.keyword}
                      </span>
                    )}
                    <h2 className="text-2xl font-bold text-[#992426] mb-3">
                      {article.title}
                    </h2>
                  </div>

                  {/* Article Content */}
                  <div className="prose max-w-none mb-4">
                    <p className="text-gray-600 leading-relaxed">
                      {article.content}
                    </p>
                  </div>

                  {/* Article Metadata */}
                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
                    <div className="flex items-center space-x-3">
                      {/* Profile Picture with Initials */}
                      <div className="w-10 h-10 bg-[#992426] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {article.user ? getInitials(article.user.username) : 'U'}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium block">
                          {article.user?.username || 'Unknown User'}
                        </span>
                        {article.category && (
                          <span className="text-gray-500">
                            {article.category.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <time className="text-sm text-gray-500">
                      {formatDate(article.created_at)}
                    </time>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-4">
                {hasSearched ? 'No articles found matching your search.' : 'No articles available at the moment.'}
              </div>
              {hasSearched && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setHasSearched(false);
                  }}
                  className="text-[#992426] hover:text-[#7a1d1f] font-medium"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}