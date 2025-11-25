import AppLayout from '@/layouts/app-layout';
import { admin_articles } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useState } from 'react';

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

export default function SubmittedArticles({ articles }: { articles: any[] }) {
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
    router.visit(`/admin/articles/${articleId}/approve`, {
      method: 'patch',
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
    router.visit(`/admin/articles/${articleId}/reject`, {
      method: 'patch',
      preserveScroll: true,
      onSuccess: () => {
        console.log('Article rejected successfully');
      },
      onError: (errors) => {
        console.error('Failed to reject article:', errors);
      }
    });
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getPublishedDate = (article: Article) => {
    return article.status === 'approved' ? article.updated_at : null;
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Submitted Articles" />
      <div className="flex flex-col gap-6 p-6 bg-white">

        {/* Header Buttons */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Submitted Articles</h2>
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
                    <td className="px-6 py-4 text-gray-600">{formatDate(article.created_at)}</td>
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
                      {formatDate(getPublishedDate(article))}
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
                    <div className="font-medium text-gray-900 mt-1">{formatDate(selectedArticle.created_at)}</div>
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
                    <div className="font-medium text-gray-900 mt-1">{formatDate(selectedArticle.updated_at)}</div>
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