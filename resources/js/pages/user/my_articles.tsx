import AppLayout from '@/layouts/app-layout';
import { my_articles } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { X, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import FeedbackWidget from '@/components/feedback-widget';
import ArticleFilter from '@/components/article-filter';

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

interface PaginationData {
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

type PageProps = {
  articles: {
    data: Article[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
  statuses?: Option[];
  categories?: Option[];
};

function hasPageProps(props: any): props is PageProps {
  return props && props.articles && Array.isArray(props.articles.data);
}

export default function MyArticles() {
  const page = usePage();
  const props = page.props;
  
  const articlesData = hasPageProps(props) ? props.articles : { 
    data: [], 
    current_page: 1, 
    last_page: 1, 
    per_page: 20, 
    total: 0, 
    from: 0, 
    to: 0 
  };
  
  const statuses = hasPageProps(props) ? (props.statuses || []) : [];
  const categories = hasPageProps(props) ? (props.categories || []) : [];
  
  const articles: Article[] = articlesData.data;
  const pagination: PaginationData = {
    current_page: articlesData.current_page,
    last_page: articlesData.last_page,
    per_page: articlesData.per_page,
    total: articlesData.total,
    from: articlesData.from,
    to: articlesData.to,
  };
  
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(pagination.current_page);

  const openModal = (article: Article) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedArticle(null);
  };

  const handleDeleteClick = (e: React.MouseEvent, article: Article) => {
    e.stopPropagation(); // Prevent opening the modal
    setArticleToDelete(article);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!articleToDelete) return;
    
    setIsDeleting(true);
    
    try {
      await router.delete(`/articles/${articleToDelete.article_id}`, {
        preserveScroll: true,
        onSuccess: () => {
          setIsDeleteConfirmOpen(false);
          setArticleToDelete(null);
          setIsDeleting(false);
        },
        onError: () => {
          setIsDeleting(false);
          alert('Failed to delete article. Please try again.');
        },
      });
    } catch (error) {
      setIsDeleting(false);
      console.error('Delete error:', error);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteConfirmOpen(false);
    setArticleToDelete(null);
  };

  const handlePageChange = (pageNum: number) => {
    if (pageNum < 1 || pageNum > pagination.last_page) return;
    
    setCurrentPage(pageNum);
    router.get(`/my_articles?page=${pageNum}`, {}, {
      preserveState: true,
      preserveScroll: true,
      replace: true,
    });
  };

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

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Articles</h1>
            {pagination && (
              <p className="text-sm text-gray-600 mt-1">
                Showing <span className="font-bold">{pagination.from}</span> - <span className="font-bold">{pagination.to}</span> of <span className="font-bold">{pagination.total}</span> results
              </p>
            )}
          </div>
          <Link href="/upload_article">
            <Button className="bg-[#770000] hover:bg-red-800 text-white px-6 py-2">
              Create Article
            </Button>
          </Link>
        </div>

        {/* Filter Section */}
        <ArticleFilter 
          statuses={statuses} 
          categories={categories}
          className="border-t pt-4"
        />

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead>
              <tr className="bg-[#770000] text-white">
                <th className="px-6 py-4 font-semibold">Title</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Date Submitted</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Date Published</th>
                <th className="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody>
              {articles.length > 0 ? (
                articles.map((article) => (
                  <tr
                    key={article.article_id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors group"
                  >
                    <td 
                      className="px-6 py-4 font-medium text-gray-900 cursor-pointer"
                      onClick={() => openModal(article)}
                    >
                      {article.title}
                    </td>
                    <td 
                      className="px-6 py-4 text-gray-600 cursor-pointer"
                      onClick={() => openModal(article)}
                    >
                      {article.category || '-'}
                    </td>
                    <td 
                      className="px-6 py-4 text-gray-600 cursor-pointer"
                      onClick={() => openModal(article)}
                    >
                      {formatDate(article.created_at)}
                    </td>
                    <td 
                      className="px-6 py-4 cursor-pointer"
                      onClick={() => openModal(article)}
                    >
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(article.status)}`}>
                        {article.status}
                      </span>
                    </td>
                    <td 
                      className="px-6 py-4 text-gray-600 cursor-pointer"
                      onClick={() => openModal(article)}
                    >
                      {formatDate(getPublishedDate(article))}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={(e) => handleDeleteClick(e, article)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors group-hover:bg-gray-100"
                        title="Delete Article"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    No articles created yet...
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
                  {getPageNumbers().map((pageNum, index) => (
                    <Button
                      key={index}
                      variant={pageNum === pagination.current_page ? "default" : "outline"}
                      onClick={() => typeof pageNum === 'number' ? handlePageChange(pageNum) : null}
                      disabled={pageNum === '...'}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                        pageNum === pagination.current_page
                          ? 'bg-[#770000] text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#770000]'
                          : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                      } ${pageNum === '...' ? 'cursor-default' : ''}`}
                    >
                      {pageNum}
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

        {/* Article Details Modal */}
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

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                <Button 
                  variant="outline" 
                  onClick={closeModal}
                  className="border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteConfirmOpen && articleToDelete && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full border border-gray-200 shadow-2xl">
              {/* Header */}
              <div className="flex items-center gap-3 p-6 border-b border-gray-200">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Delete Article</h3>
                  <p className="text-sm text-gray-500">Article: {articleToDelete.article_id}</p>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-gray-700">
                  Are you sure you want to delete this article? This action cannot be undone.
                </p>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-900">
                    {articleToDelete.title}
                  </p>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    Category: {articleToDelete.category || '-'}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Status: <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(articleToDelete.status)}`}>
                      {articleToDelete.status}
                    </span>
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                <Button 
                  variant="outline" 
                  onClick={handleCancelDelete}
                  className="border-gray-300 text-gray-700 hover:bg-gray-100"
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleConfirmDelete}
                  className="bg-[#770000] hover:bg-[#992426] text-white"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                      Deleting...
                    </>
                  ) : (
                    'Delete Article'
                  )}
                </Button>
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