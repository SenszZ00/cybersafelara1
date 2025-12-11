import AppLayout from '@/layouts/app-layout';
import { admin_articles } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import ArticleFilter from '@/components/article-filter';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Submitted Articles',
    href: admin_articles().url,
  },
];

interface Article {
  article_id: number;
  title: string;
  category: string;
  username: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  status: string;
  content?: string;
}

interface PaginationProps {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

interface Option {
  id: number;
  name: string;
}

export default function SubmittedArticles({ 
  articles, 
  pagination,
  statuses = [],
  categories = []
}: { 
  articles: any[],
  pagination: PaginationProps,
  statuses?: Option[],
  categories?: Option[]
}) {
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

  const handleApprove = (articleId: number) => {
    router.patch(`/admin/articles/${articleId}/approve`, {
      page: pagination.current_page // Pass current page to backend
    }, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        console.log('Article approved successfully');
      },
      onError: (errors) => {
        console.error('Failed to approve article:', errors);
      }
    });
  };

  const handleReject = (articleId: number) => {
    router.patch(`/admin/articles/${articleId}/reject`, {
      page: pagination.current_page // Pass current page to backend
    }, {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        console.log('Article rejected successfully');
      },
      onError: (errors) => {
        console.error('Failed to reject article:', errors);
      }
    });
  };

  const handlePageChange = (page: number) => {
    router.get(`/admin/admin_articles?page=${page}`, {}, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  // Format date to show both date and time
  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return (
      <div className="flex flex-col">
        <span>{date.toLocaleDateString()}</span>
        <span className="text-xs text-gray-500">
          {date.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          })}
        </span>
      </div>
    );
  };

  const getPublishedDate = (article: Article) => {
    return article.status === 'approved' ? article.updated_at : null;
  };

  // Generate page numbers for pagination with dots
  const getPageNumbers = () => {
    const current = pagination.current_page;
    const last = pagination.last_page;
    const delta = 1;
    const range = [];
    const rangeWithDots = [];

    for (let i = 1; i <= last; i++) {
      if (i === 1 || i === last || (i >= current - delta && i <= current + delta)) {
        range.push(i);
      }
    }

    let prev = 0;
    for (const i of range) {
      if (prev) {
        if (i - prev === 2) {
          rangeWithDots.push(prev + 1);
        } else if (i - prev !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      prev = i;
    }

    return rangeWithDots;
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Submitted Articles" />
      <div className="flex flex-col gap-6 p-6 bg-white">

        {/* Header Buttons */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Submitted Articles</h2>
            {pagination && (
              <p className="text-sm text-gray-600 mt-1">
                Showing  <span className="font-bold">{pagination.from}</span>  -  <span className="font-bold">{pagination.to}</span>  of  <span className="font-bold">{pagination.total}</span>  results
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <Link href="/admin_public_articles">
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                View Feed
              </Button>
            </Link>
            <Button variant="default" asChild className="bg-[#770000] text-white hover:bg-[#992426]">
              <a href="/admin_upload_article">Upload Article</a>
            </Button>
          </div>
        </div>

        {/* Filter Section */}
        <ArticleFilter 
          statuses={statuses} 
          categories={categories}
          className="border-t pt-4"
        />

        {/* Table Section */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead>
              <tr className="bg-[#770000] text-white">
                <th className="px-6 py-4 font-semibold">Title</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">User ID</th>
                <th className="px-6 py-4 font-semibold">Date Submitted</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Date Published</th>
                <th className="px-6 py-4 font-semibold text-center">Actions</th>
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
                    <td className="px-6 py-4 text-gray-600">{article.user_id}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {formatDateTime(article.created_at)}
                    </td>
                    <td className="px-6 py-4 capitalize">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        article.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : article.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {article.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {formatDateTime(getPublishedDate(article))}
                    </td>
                    <td className="px-6 py-4 text-center flex justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleApprove(article.article_id)}
                        disabled={article.status === 'approved'}
                        className="bg-green-300 border-green-500 text-green-700 hover:bg-green-50 hover:text-green-800"
                      >
                        {article.status === 'approved' ? 'Approved' : 'Approve'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReject(article.article_id)}
                        disabled={article.status === 'rejected'}
                        className="bg-red-300 border-red-500 text-red-700 hover:bg-red-50 hover:text-red-800"
                      >
                        {article.status === 'rejected' ? 'Rejected' : 'Reject'}
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500">
                    No submitted articles found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.last_page > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.current_page - 1)}
                disabled={pagination.current_page === 1}
                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.current_page + 1)}
                disabled={pagination.current_page === pagination.last_page}
                className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Next
              </Button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Page <span className="font-medium">{pagination.current_page}</span> of{' '}
                  <span className="font-medium">{pagination.last_page}</span>
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(pagination.current_page - 1)}
                    disabled={pagination.current_page === 1}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  {/* Page numbers with dots */}
                  {getPageNumbers().map((page, index) => (
                    <Button
                      key={index}
                      variant={page === pagination.current_page ? "default" : "outline"}
                      onClick={() => typeof page === 'number' ? handlePageChange(page) : null}
                      disabled={page === '...'}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                        page === pagination.current_page
                          ? 'bg-[#770000] text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#770000]'
                          : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                      } ${page === '...' ? 'cursor-default' : ''}`}
                    >
                      {page}
                    </Button>
                  ))}

                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(pagination.current_page + 1)}
                    disabled={pagination.current_page === pagination.last_page}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Modal/Popup */}
        {isModalOpen && selectedArticle && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 shadow-2xl">
              {/* Header */}
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

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Article Metadata */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                  <div>
                    <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">Category</span>
                    <div className="font-medium text-gray-900 mt-1">{selectedArticle.category || '-'}</div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">Submitted by</span>
                    <div className="font-medium text-gray-900 mt-1">{selectedArticle.username}</div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">Status</span>
                    <div className="font-medium text-gray-900 mt-1 capitalize">{selectedArticle.status}</div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">Submitted</span>
                    <div className="font-medium text-gray-900 mt-1">
                      {formatDateTime(selectedArticle.created_at)}
                    </div>
                  </div>
                </div>

                {/* Article Content */}
                <div>
                  <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">Article Content</span>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg whitespace-pre-wrap min-h-[200px] text-gray-700 border border-gray-200">
                    {selectedArticle.content || 'No content available for this article.'}
                  </div>
                </div>

                {/* Published Date (if published) */}
                {selectedArticle.status === 'approved' && (
                  <div className="text-sm">
                    <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">Published on</span>
                    <div className="font-medium text-gray-900 mt-1">
                      {formatDateTime(selectedArticle.updated_at)}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                <Button
                  variant="default"
                  onClick={() => {
                    handleApprove(selectedArticle.article_id);
                    closeModal();
                  }}
                  disabled={selectedArticle.status === 'approved'}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {selectedArticle.status === 'approved' ? 'Already Approved' : 'Approve Article'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    handleReject(selectedArticle.article_id);
                    closeModal();
                  }}
                  disabled={selectedArticle.status === 'rejected'}
                  className="border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800"
                >
                  {selectedArticle.status === 'rejected' ? 'Already Rejected' : 'Reject Article'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}