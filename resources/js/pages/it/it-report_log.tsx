import AppLayout from '@/layouts/app-layout';
import { it_report_log } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, FileText, Calendar, AlertCircle, ChevronLeft, ChevronRight, User, MessageSquare } from 'lucide-react';
import ReportFilter from '@/components/report-filter';

interface ReportLogItem {
    report_id: number;
    report_category_id: number;
    resolution_details: string;
    timestamp: string;
    status: string;
    category?: {
        id: number;
        name: string;
    };
    user?: {
        username?: string;
    };
    user_id?: number;
    description?: string;
    created_at?: string;
}

interface Option {
    id: number;
    name: string;
}

interface PaginationData {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Report Log',
        href: it_report_log().url,
    },
];

export default function ItReportLog() {
    const { logs: logsProp, statuses = [], categories = [] } = usePage().props as {
        logs?: {
            data: ReportLogItem[];
            current_page: number;
            last_page: number;
            per_page: number;
            total: number;
            from: number;
            to: number;
        } | ReportLogItem[];
        statuses?: Option[];
        categories?: Option[];
    };

    const [selectedLog, setSelectedLog] = useState<ReportLogItem | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    // Handle both array and paginated response formats
    const isPaginated = logsProp && !Array.isArray(logsProp) && 'data' in logsProp;
    
    const logs: ReportLogItem[] = isPaginated 
        ? (logsProp as any).data 
        : logsProp as ReportLogItem[];
    
    const pagination: PaginationData | null = isPaginated ? {
        current_page: (logsProp as any).current_page,
        last_page: (logsProp as any).last_page,
        per_page: (logsProp as any).per_page,
        total: (logsProp as any).total,
        from: (logsProp as any).from,
        to: (logsProp as any).to,
    } : null;

    const getStatusColor = (status: string | undefined) => {
        switch (status?.toLowerCase()) {
            case 'resolved': return 'bg-green-100 text-green-800';
            case 'in progress': 
            case 'under review': return 'bg-blue-100 text-blue-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
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
        if (!pagination || pageNum < 1 || pageNum > pagination.last_page) return;
        
        setCurrentPage(pageNum);
        // You'll need to add routing logic similar to AssignedReports
        // router.get(`${it_report_log().url}?page=${pageNum}`, {}, {
        //     preserveState: true,
        //     preserveScroll: true,
        //     replace: true,
        // });
    };

    const getPageNumbers = () => {
        if (!pagination) return [];
        
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
            <Head title="Report Log" />

            <div className="flex flex-col gap-6 p-6 bg-white">
                {/* Header */}
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
                {(!logs || logs.length === 0) ? (
                    <div className="text-center py-12 text-gray-500">
                        No report logs found.
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm text-left">
                                <thead>
                                    <tr className="bg-red-900 text-white">
                                        <th className="px-6 py-4 font-semibold">Report ID</th>
                                        <th className="px-6 py-4 font-semibold">Category</th>
                                        <th className="px-6 py-4 font-semibold">Resolution Details</th>
                                        <th className="px-6 py-4 font-semibold">Timestamp</th>
                                        <th className="px-6 py-4 font-semibold">Status</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {logs.map((log, index) => (
                                        <tr 
                                            key={index} 
                                            className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                                            onClick={() => openModal(log)}
                                        >
                                            <td className="px-6 py-4 font-mono text-gray-900">
                                                {log.report_id}
                                            </td>
                                            <td className="px-6 py-4 text-gray-900">
                                                {log.category?.name || 'Unknown Category'}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 max-w-md truncate">
                                                {log.resolution_details || 'No resolution details'}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {new Date(log.timestamp).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                                                    {log.status || 'Unknown'}
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
                                                            ? 'bg-red-900 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-900'
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
                                    <h3 className="text-xl font-bold text-gray-900">
                                        Report Log Details
                                    </h3>
                                    <p className="text-sm text-gray-500">Report {selectedLog.report_id}</p>
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
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                                    <div>
                                        <span className="text-gray-500 text-xs font-medium uppercase tracking-wide flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            Status
                                        </span>
                                        <div className="font-medium text-gray-900 mt-1">
                                            <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(selectedLog.status)}`}>
                                                {selectedLog.status || 'Unknown'}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 text-xs font-medium uppercase tracking-wide flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            Timestamp
                                        </span>
                                        <div className="font-medium text-gray-900 mt-1">
                                            {new Date(selectedLog.timestamp).toLocaleString()}
                                        </div>
                                    </div>
                                    {selectedLog.created_at && (
                                        <div>
                                            <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">
                                                Created At
                                            </span>
                                            <div className="font-medium text-gray-900 mt-1">
                                                {new Date(selectedLog.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    )}
                                    <div>
                                        <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">
                                            Category ID
                                        </span>
                                        <div className="font-medium text-gray-900 mt-1">
                                            {selectedLog.report_category_id}
                                        </div>
                                    </div>
                                </div>

                                {/* Reporter Info */}
                                {selectedLog.user?.username && (
                                    <div className="text-sm">
                                        <span className="text-gray-500 text-xs font-medium uppercase tracking-wide flex items-center gap-1">
                                            <User className="h-3 w-3" />
                                            Submitted By
                                        </span>
                                        <div className="font-medium text-gray-900 mt-1">
                                            {selectedLog.user.username}
                                        </div>
                                    </div>
                                )}

                                {/* User ID */}
                                {selectedLog.user_id && (
                                    <div className="text-sm">
                                        <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">
                                            User ID
                                        </span>
                                        <div className="font-medium text-gray-900 mt-1">
                                            {selectedLog.user_id}
                                        </div>
                                    </div>
                                )}

                                {/* Category Info */}
                                {selectedLog.category?.name && (
                                    <div className="text-sm">
                                        <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">
                                            Category
                                        </span>
                                        <div className="font-medium text-gray-900 mt-1">
                                            {selectedLog.category.name}
                                        </div>
                                    </div>
                                )}

                                {/* Original Description (if available) */}
                                {selectedLog.description && (
                                    <div>
                                        <span className="text-gray-500 text-xs font-medium uppercase tracking-wide flex items-center gap-1">
                                            <FileText className="h-3 w-3" />
                                            Original Description
                                        </span>
                                        <div className="mt-2 p-4 bg-gray-50 rounded-lg whitespace-pre-wrap text-gray-700 border border-gray-200">
                                            {selectedLog.description}
                                        </div>
                                    </div>
                                )}

                                {/* Resolution Details */}
                                <div>
                                    <span className="text-gray-500 text-xs font-medium uppercase tracking-wide flex items-center gap-1">
                                        <MessageSquare className="h-3 w-3" />
                                        Resolution Details
                                    </span>
                                    <div className="mt-2 p-4 bg-green-50 rounded-lg whitespace-pre-wrap text-gray-700 border border-green-200">
                                        {selectedLog.resolution_details || 'No resolution details provided'}
                                    </div>
                                </div>
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