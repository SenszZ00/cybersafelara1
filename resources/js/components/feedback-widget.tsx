import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { X, MessageCircle, CheckCircle } from 'lucide-react';

interface FeedbackFormData {
    subject: string;
    content: string;
}

export default function FeedbackWidget() {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [showSuccess, setShowSuccess] = useState<boolean>(false);
    
    const { data, setData, post, processing, errors, reset } = useForm<FeedbackFormData>({
        subject: '',
        content: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/feedback', {
            onSuccess: () => {
                reset();
                setIsOpen(false);
                // Show success message
                setShowSuccess(true);
                // Auto-hide after 5 seconds
                setTimeout(() => setShowSuccess(false), 5000);
            },
        });
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-[#770000] hover:bg-red-800 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 z-50 focus:outline-none focus:ring-2 focus:ring-[#770000] focus:ring-offset-2"
                aria-label="Provide Feedback"
            >
                <MessageCircle className="w-6 h-6" />
            </button>

            {/* Success Message */}
            {showSuccess && (
                <div className="fixed bottom-20 right-6 z-50">
                    <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg shadow-lg p-4 max-w-sm">
                        <div className="flex items-center">
                            <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                            <span className="flex-1 pr-2 text-sm">Feedback submitted successfully!</span>
                            <button
                                onClick={() => setShowSuccess(false)}
                                className="text-green-600 hover:text-green-800 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal */}
            <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
                <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <DialogPanel className="w-full max-w-md bg-white rounded-xl p-6 shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <DialogTitle className="text-lg font-semibold text-gray-900">
                                Send Feedback
                            </DialogTitle>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#770000] focus:ring-offset-2 rounded-full p-1"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                                    Subject *
                                </label>
                                <input
                                    id="subject"
                                    type="text"
                                    value={data.subject}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                        setData('subject', e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#770000] focus:border-[#770000]"
                                    placeholder="Brief description of your feedback"
                                    disabled={processing}
                                    required
                                />
                                {errors.subject && (
                                    <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                                    Details *
                                </label>
                                <textarea
                                    id="content"
                                    rows={4}
                                    value={data.content}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                                        setData('content', e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#770000] focus:border-[#770000]"
                                    placeholder="Please provide more details about your feedback..."
                                    disabled={processing}
                                    required
                                />
                                {errors.content && (
                                    <p className="mt-1 text-sm text-red-600">{errors.content}</p>
                                )}
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    disabled={processing}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 text-sm font-medium text-white bg-[#770000] rounded-md hover:bg-red-800 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#770000] focus:ring-offset-2 transition-colors duration-200"
                                >
                                    {processing ? 'Sending...' : 'Send Feedback'}
                                </button>
                            </div>
                        </form>
                    </DialogPanel>
                </div>
            </Dialog>
        </>
    );
}