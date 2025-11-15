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
  username: string
  user_id: string;
  created_at: string;
  status: string;
  published_at?: string | null;
  content?: string;
  author?: { // Assuming you might have author details
    name?: string;
    email?: string;
  };
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
    // Add your approve logic here
    console.log('Approving article:', articleId);
  };

  const handleReject = (articleId: number) => {
    // Add your reject logic here
    console.log('Rejecting article:', articleId);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Submitted Articles" />
      <div className="flex flex-col gap-4 p-4">

        {/* Header Buttons */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Submitted Articles</h2>
          <div className="flex gap-2">
            <Link href="/articles">
              <Button variant="secondary">View Feed</Button>
            </Link>
            <Button variant="default" asChild>
              <a href="/admin_upload_article">Upload Article</a>
            </Button>
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
          <table className="min-w-full table-auto text-sm text-left text-gray-200">
            <thead className="bg-gray-800 text-gray-100">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">User ID</th>
                <th className="px-4 py-3">Date Submitted</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date Published</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="bg-gray-900">
              {articles.length > 0 ? (
                articles.map((article) => (
                  <tr 
                    key={article.article_id} 
                    className="border-b border-gray-700 hover:bg-gray-800 cursor-pointer"
                    onClick={() => openModal(article)}
                  >
                    <td className="px-4 py-3 font-medium">{article.title}</td>
                    <td className="px-4 py-3">{article.category || '-'}</td>
                    <td className="px-4 py-3">{article.user_id}</td>
                    <td className="px-4 py-3">{article.created_at}</td>
                    <td className="px-4 py-3 capitalize">{article.status}</td>
                    <td className="px-4 py-3">{article.published_at || '-'}</td>
                    <td className="px-4 py-3 text-center flex justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => handleApprove(article.article_id)}
                      >
                        Approve
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleReject(article.article_id)}
                      >
                        Reject
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-gray-400">
                    No submitted articles found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal/Popup with Blurred Background */}
        {isModalOpen && selectedArticle && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl">
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-700">
                <h3 className="text-lg font-semibold">{selectedArticle.title}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeModal}
                  className="h-8 w-8 p-0 hover:bg-gray-800"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Article Metadata */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Category:</span>
                    <div className="font-medium">{selectedArticle.category || '-'}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Submitted by:</span>
                    <div className="font-medium">{selectedArticle.username}</div>
                    {/* If you have author details, you can display them:
                    <div className="text-gray-400 text-xs">
                      {selectedArticle.author?.email || 'No email provided'}
                    </div> */}
                  </div>
                  <div>
                    <span className="text-gray-400">Status:</span>
                    <div className="font-medium capitalize">{selectedArticle.status}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Submitted:</span>
                    <div className="font-medium">{selectedArticle.created_at}</div>
                  </div>
                </div>

                {/* Article Content */}
                <div>
                  <span className="text-gray-400 text-sm">Article Content:</span>
                  <div className="mt-2 p-4 bg-gray-800 rounded-lg whitespace-pre-wrap min-h-[200px]">
                    {selectedArticle.content || 'No content available for this article.'}
                  </div>
                </div>

                {/* Published Date (if published) */}
                {selectedArticle.published_at && (
                  <div className="text-sm">
                    <span className="text-gray-400">Published on:</span>
                    <div className="font-medium">{selectedArticle.published_at}</div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="flex justify-end gap-3 p-6 border-t border-gray-700">
                <Button 
                  variant="default"
                  onClick={() => {
                    handleApprove(selectedArticle.article_id);
                    closeModal();
                  }}
                >
                  Approve Article
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => {
                    handleReject(selectedArticle.article_id);
                    closeModal();
                  }}
                >
                  Reject Article
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}