import AppLayout from '@/layouts/app-layout';
import { messages } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { MessageSquare, X } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Messages',
    href: messages().url,
  },
];

interface Feedback {
  id: number;
  user_id: number;
  user?: {
    id?: number;
    username?: string;
    email?: string;
    name?: string;
  } | null;
  subject: string;
  content: string;
  created_at: string;
}

export default function Messages({ feedbacks }: { feedbacks: any[] }) {
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleReply = (userEmail: string, originalSubject: string) => {
    const subject = `Re: ${originalSubject}`;
    const mailtoLink = `mailto:${userEmail}?subject=${encodeURIComponent(subject)}`;
    window.location.href = mailtoLink;
  };

  const openModal = (feedback: Feedback) => {
    setSelectedFeedback(feedback);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFeedback(null);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Messages" />
      <div className="flex flex-col gap-4 p-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">User Feedback</h2>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
          <table className="min-w-full table-auto text-sm text-left text-gray-200">
            <thead className="bg-gray-800 text-gray-100">
              <tr>
                <th className="px-4 py-3">Feedback ID</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3">Submitted At</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="bg-gray-900">
              {feedbacks && feedbacks.length > 0 ? (
                feedbacks.map((f) => (
                  <tr 
                    key={f.feedback_id} 
                    className="border-b border-gray-700 hover:bg-gray-800 cursor-pointer"
                    onClick={() => openModal(f)}
                  >
                    <td className="px-4 py-3">{f.feedback_id}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">
                        {f.user?.name ?? f.user?.username ?? `User ${f.user_id}`}
                      </div>
                      <div className="text-xs text-gray-400">{f.user?.email ?? '-'}</div>
                    </td>
                    <td className="px-4 py-3 font-medium">{f.subject}</td>
                    <td className="px-4 py-3 max-w-[420px] truncate">{f.content}</td>
                    <td className="px-4 py-3">{new Date(f.created_at).toLocaleString()}</td>
                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="flex items-center gap-2"
                        onClick={() => handleReply(f.user?.email || '', f.subject)}
                        disabled={!f.user?.email}
                      >
                        <MessageSquare className="h-4 w-4" />
                        Reply
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-400">
                    No feedback messages found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal/Popup with Blurred Background */}
        {isModalOpen && selectedFeedback && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl">
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-700">
                <h3 className="text-lg font-semibold">{selectedFeedback.subject}</h3>
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
              <div className="p-6 space-y-4">
                {/* User Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">From:</span>
                    <div className="font-medium">
                      {selectedFeedback.user?.name ?? selectedFeedback.user?.username ?? `User ${selectedFeedback.user_id}`}
                    </div>
                    <div className="text-gray-400 text-xs">
                      {selectedFeedback.user?.email ?? 'No email provided'}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">Submitted:</span>
                    <div className="font-medium">
                      {new Date(selectedFeedback.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Full Message */}
                <div>
                  <span className="text-gray-400 text-sm">Message:</span>
                  <div className="mt-2 p-4 bg-gray-800 rounded-lg whitespace-pre-wrap">
                    {selectedFeedback.content}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end p-6 border-t border-gray-700">
                <Button 
                  onClick={() => {
                    handleReply(selectedFeedback.user?.email || '', selectedFeedback.subject);
                    closeModal();
                  }}
                  disabled={!selectedFeedback.user?.email}
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Reply via Email
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}