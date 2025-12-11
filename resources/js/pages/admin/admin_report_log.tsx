import AppLayout from '@/layouts/app-layout';
import { admin_report_log } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { X, User, Clock, FileText, AlertCircle, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReportFilter from '@/components/report-filter';

interface ReportLogItem {
    log_id: number;
    report_id: number;
    report_category_id: number;
    resolution_details: string;
    timestamp: string;
    status: string;
    category?: {
        id: number;
        name: string;
    };
    it_personnel?: {
        id: number;
        username: string;
    };
    report?: {
        description?: string;
        anonymous_flag?: boolean;
        user?: {
            username: string;
        };
        created_at?: string;
    };
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

// Define the page props type
type PageProps = {
    logs: ReportLogItem[];
    pagination: PaginationData;
    statuses?: Option[];
    categories?: Option[];
};

// Type guard to check if props have the expected structure
function hasPageProps(props: any): props is PageProps {
    return props && Array.isArray(props.logs) && props.pagination;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Report Log',
        href: admin_report_log().url,
    },
];

export default function AdminReportLog() {
    const page = usePage();
    const props = page.props;
    
    // Safely extract data from props
    const logs = hasPageProps(props) ? props.logs : [];
    const pagination = hasPageProps(props) ? props.pagination : {
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: 0,
        from: 0,
        to: 0,
    };
    const statuses = hasPageProps(props) ? (props.statuses || []) : [];
    const categories = hasPageProps(props) ? (props.categories || []) : [];
    
    const [currentPage, setCurrentPage] = useState(pagination.current_page);
    const [selectedLog, setSelectedLog] = useState<ReportLogItem | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
            case 'resolved':
                return 'bg-green-100 text-green-800';
            case 'in_progress':
            case 'in progress':
            case 'under review':
                return 'bg-blue-100 text-blue-800';
            case 'pending':
            case 'assigned':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const openModal = (log: ReportLogItem) => {
        setSelectedLog(log);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedLog(null);
    };

    const handlePageChange = (pageNum: number) => {
        if (pageNum < 1 || pageNum > pagination.last_page) return;
        
        setCurrentPage(pageNum);
        router.get(admin_report_log().url, { page: pageNum }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onSuccess: () => {
                console.log('Page changed successfully');
            },
            onError: (errors) => {
                console.error('Error changing page:', errors);
            }
        });
    };

    // Update current page when pagination changes from server
    useEffect(() => {
        setCurrentPage(pagination.current_page);
    }, [pagination.current_page]);

    // Generate page numbers for pagination with dots (same as SubmittedReports)
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

    // Format timestamp to show both date and time
    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Report Log" />
            
            <div className="flex flex-col gap-6 p-6 bg-white">
                {/* Header - Matching Submitted Reports page */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Report Log</h1>
                        {pagination && (
                            <p className="text-sm text-gray-600 mt-1">
                                Showing <span className="font-bold">{pagination.from}</span> - <span className="font-bold">{pagination.to}</span> of <span className="font-bold">{pagination.total}</span> results
                            </p>
                        )}
                    </div>
                </div>

                {/* Filter Section */}
                <ReportFilter 
                    statuses={statuses} 
                    categories={categories}
                    className="border-t pt-4"
                />

                {/* Reports Table */}
                {logs.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        No report logs found.
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm text-left">
                                <thead>
                                    <tr className="bg-red-900 text-white">
                                        <th className="px-6 py-4 font-semibold">Log ID</th>
                                        <th className="px-6 py-4 font-semibold">Report ID</th>
                                        <th className="px-6 py-4 font-semibold">Incident Type</th>
                                        <th className="px-6 py-4 font-semibold">Resolution Details</th>
                                        <th className="px-6 py-4 font-semibold">IT Personnel</th>
                                        <th className="px-6 py-4 font-semibold">Date Submitted</th>
                                        <th className="px-6 py-4 font-semibold">Status</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {logs.map((log) => (
                                        <tr 
                                            key={log.log_id} 
                                            className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                                            onClick={() => openModal(log)}
                                        >
                                            <td className="px-6 py-4 font-mono text-gray-900">{log.log_id}</td>
                                            <td className="px-6 py-4 font-mono text-gray-900">{log.report_id}</td>
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                {log.category?.name || 'Unknown Category'}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 max-w-md truncate">
                                                {log.resolution_details}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {log.it_personnel?.username || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                <div className="flex flex-col">
                                                    <span>{new Date(log.timestamp).toLocaleDateString()}</span>
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(log.timestamp).toLocaleTimeString([], { 
                                                            hour: '2-digit', 
                                                            minute: '2-digit',
                                                            hour12: true 
                                                        })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                                                    {log.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
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
                    </>
                )}

                {/* Log Details Modal */}
                {isModalOpen && selectedLog && (
                    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 shadow-2xl">
                            {/* Header */}
                            <div className="flex justify-between items-center p-6 border-b border-gray-200">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Log Details</h3>
                                    <p className="text-sm text-gray-500">Log ID: {selectedLog.log_id}</p>
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
                                {/* Log Metadata */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
                                    <div>
                                        <span className="text-gray-500 text-xs font-medium uppercase tracking-wide flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            Timestamp
                                        </span>
                                        <div className="font-medium text-gray-900 mt-1">
                                            <div className="flex flex-col">
                                                <span>{new Date(selectedLog.timestamp).toLocaleDateString('en-US', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}</span>
                                                <span className="text-sm text-gray-600">
                                                    {new Date(selectedLog.timestamp).toLocaleTimeString('en-US', {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        second: '2-digit',
                                                        hour12: true
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 text-xs font-medium uppercase tracking-wide flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            Status
                                        </span>
                                        <div className="font-medium text-gray-900 mt-1">
                                            <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(selectedLog.status)}`}>
                                                {selectedLog.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">
                                            Report ID
                                        </span>
                                        <div className="font-medium text-gray-900 mt-1">
                                            #{selectedLog.report_id}
                                        </div>
                                    </div>
                                </div>

                                {/* Category Info */}
                                <div className="text-sm">
                                    <span className="text-gray-500 text-xs font-medium uppercase tracking-wide flex items-center gap-1">
                                        <FileText className="h-3 w-3" />
                                        Incident Type
                                    </span>
                                    <div className="font-medium text-gray-900 mt-1">
                                        {selectedLog.category?.name || 'Unknown Category'}
                                    </div>
                                </div>

                                {/* IT Personnel Info */}
                                <div className="text-sm">
                                    <span className="text-gray-500 text-xs font-medium uppercase tracking-wide flex items-center gap-1">
                                        <Users className="h-3 w-3" />
                                        IT Personnel
                                    </span>
                                    <div className="font-medium text-gray-900 mt-1">
                                        {selectedLog.it_personnel?.username || 'Not Assigned'}
                                    </div>
                                </div>

                                {/* Resolution Details */}
                                <div>
                                    <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">
                                        Resolution Details
                                    </span>
                                    <div className="mt-2 p-4 bg-gray-50 rounded-lg whitespace-pre-wrap text-gray-700 border border-gray-200">
                                        {selectedLog.resolution_details}
                                    </div>
                                </div>

                                {/* If you have report description in the log data */}
                                {selectedLog.report?.description && (
                                    <div>
                                        <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">
                                            Original Report Description
                                        </span>
                                        <div className="mt-2 p-4 bg-gray-50 rounded-lg whitespace-pre-wrap text-gray-700 border border-gray-200">
                                            {selectedLog.report.description}
                                        </div>
                                    </div>
                                )}

                                {/* Report Submitter Info (if available) */}
                                {selectedLog.report?.user?.username && (
                                    <div className="text-sm">
                                        <span className="text-gray-500 text-xs font-medium uppercase tracking-wide flex items-center gap-1">
                                            <User className="h-3 w-3" />
                                            Submitted By
                                        </span>
                                        <div className="font-medium text-gray-900 mt-1">
                                            {selectedLog.report.user.username}
                                            {selectedLog.report.anonymous_flag && ' (Anonymous)'}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
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
            </div>
        </AppLayout>
    );
}