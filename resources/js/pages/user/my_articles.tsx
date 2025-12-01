import AppLayout from '@/layouts/app-layout';
import { my_articles } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useState } from 'react';
import FeedbackWidget from '@/components/feedback-widget'; // Make sure this path is correct

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'My Articles',
    href: my_articles().url,
  },
];

interface Article {
  article_id: number;
  title: string;
  category: string;
  created_at: string;
  updated_at: string;
  status: string;
  content?: string;
}

export default function MyArticles({ articles }: { articles: Article[] }) {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (article: Article) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedArticle(null);
  };

  // Format date
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Show publish date only when approved
  const getPublishedDate = (article: Article) => {
    return article.status === 'approved' ? article.updated_at : null;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="My Articles" />

      <div className="flex flex-col gap-6 p-6 bg-white min-h-screen">

        {/* Header Buttons */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">My Articles</h1>
          <Link href="/upload_article">
            <Button className="bg-[#770000] hover:bg-[#992426] text-white">
              Create Article
            </Button>
          </Link>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead>
              <tr className="bg-[#770000] text-white">
                <th className="px-6 py-4 font-semibold">Title</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Date Submitted</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Published</th>
              </tr>
            </thead>

            <tbody>
              {articles.length > 0 ? (
                articles.map((article) => (
                  <tr
                    key={article.article_id}
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => openModal(article)}
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">{article.title}</td>
                    <td className="px-6 py-4 text-gray-600">{article.category || '-'}</td>
                    <td className="px-6 py-4 text-gray-600">{formatDate(article.created_at)}</td>
                    <td className="px-6 py-4 capitalize">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(article.status)}`}>
                        {article.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{formatDate(getPublishedDate(article))}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-500">
                    No articles created yet...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {isModalOpen && selectedArticle && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 shadow-2xl">

              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">{selectedArticle.title}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeModal}
                  className="h-8 w-8 p-0 hover:bg-gray-100 text-gray-500"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">

                {/* Metadata */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                  <div>
                    <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">Category</span>
                    <div className="font-medium text-gray-900 mt-1">{selectedArticle.category || '-'}</div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">Status</span>
                    <div className="font-medium text-gray-900 mt-1 capitalize">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedArticle.status)}`}>
                        {selectedArticle.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">Submitted</span>
                    <div className="font-medium text-gray-900 mt-1">{formatDate(selectedArticle.created_at)}</div>
                  </div>
                  {selectedArticle.status === 'approved' && (
                    <div>
                      <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">Published</span>
                      <div className="font-medium text-gray-900 mt-1">{formatDate(selectedArticle.updated_at)}</div>
                    </div>
                  )}
                </div>

                {/* Article Content */}
                <div>
                  <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">Article Content</span>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg whitespace-pre-wrap min-h-[200px] text-gray-700 border border-gray-200">
                    {selectedArticle.content || 'No content available.'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Feedback Widget */}
        <FeedbackWidget />
      </div>
    </AppLayout>
  );
}