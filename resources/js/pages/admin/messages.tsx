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

  // Format date and time separately
  const formatDateTime = (dateString: string) => {
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

  // Format for modal with more detailed timestamp
  const formatDetailedDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return (
      <div className="flex flex-col">
        <span>{date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}</span>
        <span className="text-sm text-gray-600">
          {date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
          })}
        </span>
      </div>
    );
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Messages" />
      <div className="flex flex-col gap-6 p-6 bg-white">

        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">User Feedback</h2>
          <div className="text-sm text-gray-500">
            {feedbacks?.length || 0} messages
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead>
              <tr className="bg-[#770000] text-white">
                <th className="px-6 py-4 font-semibold">Feedback ID</th>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Subject</th>
                <th className="px-6 py-4 font-semibold">Message</th>
                <th className="px-6 py-4 font-semibold">Date Submitted</th>
                <th className="px-6 py-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {feedbacks && feedbacks.length > 0 ? (
                feedbacks.map((f) => (
                  <tr 
                    key={f.feedback_id} 
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => openModal(f)}
                  >
                    <td className="px-6 py-4 font-mono text-gray-900">{f.feedback_id}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {f.user?.name ?? f.user?.username ?? `User ${f.user_id}`}
                      </div>
                      <div className="text-xs text-gray-500">{f.user?.email ?? '-'}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{f.subject}</td>
                    <td className="px-6 py-4 text-gray-600 max-w-[420px] truncate">{f.content}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {formatDateTime(f.created_at)}
                    </td>
                    <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex items-center gap-2 border-[#770000] text-[#770000] hover:bg-[#770000] hover:text-white"
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
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    No feedback messages found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal/Popup */}
        {isModalOpen && selectedFeedback && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 shadow-2xl">
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedFeedback.subject}</h3>
                  <p className="text-sm text-gray-500">Feedback #{selectedFeedback.id}</p>
                </div>
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
                {/* User Info */}
                <div className="grid grid-cols-2 gap-6 text-sm">
                  <div>
                    <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">From</span>
                    <div className="font-medium text-gray-900 mt-1">
                      {selectedFeedback.user?.name ?? selectedFeedback.user?.username ?? `User ${selectedFeedback.user_id}`}
                    </div>
                    <div className="text-gray-500 text-xs mt-1">
                      {selectedFeedback.user?.email ?? 'No email provided'}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">Submitted</span>
                    <div className="font-medium text-gray-900 mt-1">
                      {formatDetailedDateTime(selectedFeedback.created_at)}
                    </div>
                  </div>
                </div>

                {/* Full Message */}
                <div>
                  <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">Message</span>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg whitespace-pre-wrap text-gray-700 border border-gray-200">
                    {selectedFeedback.content}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                <Button 
                  onClick={() => {
                    handleReply(selectedFeedback.user?.email || '', selectedFeedback.subject);
                    closeModal();
                  }}
                  disabled={!selectedFeedback.user?.email}
                  className="flex items-center gap-2 bg-[#770000] hover:bg-[#992426] text-white"
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