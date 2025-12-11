import AppLayout from '@/layouts/app-layout';
import { it_reports } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, FileText, Calendar, User, AlertCircle, Paperclip, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import ReportFilter from '@/components/report-filter';

interface Report {
    report_id: number;
    user_id: number;
    user?: { username?: string };
    report_category_id: number;
    description: string;
    attachments?: string | null;
    attachment_name?: string;
    attachment_mime?: string;
    created_at: string;
    updated_at?: string;
    report_status_id: number;
    status?: {
        name: string;
    };
    category?: {
        id: number;
        name: string;
    };
    anonymous_flag?: boolean;
}

interface StatusOption {
    id: number;
    name: string;
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
        title: 'Assigned Reports',
        href: it_reports().url,
    },
];

export default function AssignedReports() {
    const { reports: reportsProp, statuses, categories = [] } = usePage().props as unknown as {
        reports: {
            data: Report[];
            current_page: number;
            last_page: number;
            per_page: number;
            total: number;
            from: number;
            to: number;
        } | Report[];
        statuses: StatusOption[];
        categories?: Option[];
    };

    // Handle both array and paginated response formats
    const isPaginated = reportsProp && !Array.isArray(reportsProp) && 'data' in reportsProp;
    
    const reports: Report[] = isPaginated 
        ? (reportsProp as any).data 
        : reportsProp as Report[];
    
    const pagination: PaginationData | null = isPaginated ? {
        current_page: (reportsProp as any).current_page,
        last_page: (reportsProp as any).last_page,
        per_page: (reportsProp as any).per_page,
        total: (reportsProp as any).total,
        from: (reportsProp as any).from,
        to: (reportsProp as any).to,
    } : null;

    const [showResolutionModal, setShowResolutionModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<number | null>(null);
    const [resolutionDetails, setResolutionDetails] = useState('');
    const [currentPage, setCurrentPage] = useState(pagination?.current_page || 1);
    
    // Find the "Resolved" status ID
    const resolvedStatus = statuses.find(status => status.name.toLowerCase() === 'resolved');
    const resolvedStatusId = resolvedStatus?.id;

    const getStatusColor = (status: string | undefined) => {
        switch (status?.toLowerCase()) {
            case 'resolved': return 'bg-green-100 text-green-800';
            case 'in progress': 
            case 'under review': return 'bg-blue-100 text-blue-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleStatusChange = (reportId: number, newStatusId: number) => {
        const report = reports.find(r => r.report_id === reportId);
        
        // Check if the new status is "Resolved" by ID
        if (resolvedStatusId && newStatusId === resolvedStatusId) {
            // Show modal for resolved status
            setSelectedReport(report || null);
            setSelectedStatus(newStatusId);
            setShowResolutionModal(true);
        } else {
            // Regular status change
            updateStatus(reportId, newStatusId, '');
        }
    };

    const updateStatus = (reportId: number, newStatusId: number, resolution: string) => {
        router.put(
            `/reports/${reportId}/status`,
            { 
                report_status_id: newStatusId,
                resolution_details: resolution 
            },
            { 
                preserveScroll: true,
                onSuccess: () => {
                    window.location.reload();
                }
            }
        );
    };

    const handleResolutionSubmit = () => {
        if (selectedReport && selectedStatus) {
            updateStatus(selectedReport.report_id, selectedStatus, resolutionDetails);
            setShowResolutionModal(false);
            setResolutionDetails('');
            setSelectedReport(null);
            setSelectedStatus(null);
        }
    };

    const handleCancelResolution = () => {
        setShowResolutionModal(false);
        setResolutionDetails('');
        setSelectedReport(null);
        setSelectedStatus(null);
    };

    const openDetailsModal = (report: Report) => {
        setSelectedReport(report);
        setIsDetailsModalOpen(true);
    };

    const closeDetailsModal = () => {
        setIsDetailsModalOpen(false);
        setSelectedReport(null);
    };

    const handlePageChange = (pageNum: number) => {
        if (!pagination || pageNum < 1 || pageNum > pagination.last_page) return;
        
        setCurrentPage(pageNum);
        router.get(`${it_reports().url}?page=${pageNum}`, {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
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

    const handleDownloadAttachment = (e: React.MouseEvent, attachmentUrl: string) => {
        e.stopPropagation(); // Prevent row click when downloading
        window.open(attachmentUrl, '_blank');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Assigned Reports" />
            <div className="flex flex-col gap-6 p-6 bg-white">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Assigned Reports</h1>
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

                {/* Resolution Modal */}
                {showResolutionModal && (
                    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl max-w-md w-full border border-gray-200 shadow-2xl">
                            <div className="p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Resolution Details</h3>
                                <p className="mb-4 text-gray-600">
                                    Please provide details on how you resolved this issue:
                                </p>
                                <textarea
                                    value={resolutionDetails}
                                    onChange={(e) => setResolutionDetails(e.target.value)}
                                    placeholder="Describe the steps taken to resolve the issue..."
                                    className="w-full h-32 p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-red-900 focus:border-transparent"
                                />
                                <div className="flex gap-3 justify-end">
                                    <Button
                                        onClick={handleCancelResolution}
                                        variant="outline"
                                        className="border-gray-300 text-gray-700 hover:bg-gray-100"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleResolutionSubmit}
                                        disabled={!resolutionDetails.trim()}
                                        className="bg-red-900 hover:bg-red-800 text-white px-4 py-2 rounded-lg disabled:bg-gray-400"
                                    >
                                        Submit Resolution
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reports Table */}
                {reports.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        No assigned reports.
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm text-left">
                                <thead>
                                    <tr className="bg-red-900 text-white">
                                        <th className="px-6 py-4 font-semibold">Report ID</th>
                                        <th className="px-6 py-4 font-semibold">User</th>
                                        <th className="px-6 py-4 font-semibold">Category</th>
                                        <th className="px-6 py-4 font-semibold">Description</th>
                                        <th className="px-6 py-4 font-semibold">Attachment</th>
                                        <th className="px-6 py-4 font-semibold">Submitted</th>
                                        <th className="px-6 py-4 font-semibold">Status</th>
                                        <th className="px-6 py-4 font-semibold">Update Status</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {reports.map((report) => (
                                        <tr 
                                            key={report.report_id} 
                                            className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                                            onClick={() => openDetailsModal(report)}
                                        >
                                            <td className="px-6 py-4 font-mono text-gray-900">
                                                {report.report_id}
                                            </td>
                                            <td className="px-6 py-4 text-gray-900">
                                                {report.user?.username || `User ${report.user_id}`}
                                            </td>
                                            <td className="px-6 py-4 text-gray-900">
                                                {report.category?.name || 'Unknown Category'}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600 max-w-md truncate">
                                                {report.description}
                                            </td>
                                            <td className="px-6 py-4">
                                                {report.attachments ? (
                                                    <button
                                                        onClick={(e) => handleDownloadAttachment(e, report.attachments!)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                                                        title="Download attachment"
                                                    >
                                                        <Download className="h-3 w-3" />
                                                        Download
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">None</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {new Date(report.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor(report.status?.name)}`}>
                                                    {report.status?.name || 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <select
                                                    className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-red-900 focus:border-transparent"
                                                    value={report.report_status_id}
                                                    onClick={(e) => e.stopPropagation()}
                                                    onChange={(e) =>
                                                        handleStatusChange(
                                                            report.report_id,
                                                            Number(e.target.value)
                                                        )
                                                    }
                                                >
                                                    {statuses.map((status) => (
                                                        <option key={status.id} value={status.id}>
                                                            {status.name}
                                                        </option>
                                                    ))}
                                                </select>
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

                {/* Report Details Modal */}
                {isDetailsModalOpen && selectedReport && (
                    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 shadow-2xl">
                            {/* Header */}
                            <div className="flex justify-between items-center p-6 border-b border-gray-200">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">
                                        {selectedReport.category?.name || 'Report Details'}
                                    </h3>
                                    <p className="text-sm text-gray-500">Report {selectedReport.report_id}</p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={closeDetailsModal}
                                    className="h-8 w-8 p-0 hover:bg-gray-100 text-gray-500"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-6">
                                {/* Report Metadata */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
                                    <div>
                                        <span className="text-gray-500 text-xs font-medium uppercase tracking-wide flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            Status
                                        </span>
                                        <div className="font-medium text-gray-900 mt-1">
                                            <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(selectedReport.status?.name)}`}>
                                                {selectedReport.status?.name || 'Pending'}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 text-xs font-medium uppercase tracking-wide flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            Submitted
                                        </span>
                                        <div className="font-medium text-gray-900 mt-1">
                                            {new Date(selectedReport.created_at).toLocaleString()}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">
                                            Last Updated
                                        </span>
                                        <div className="font-medium text-gray-900 mt-1">
                                            {selectedReport.updated_at ? new Date(selectedReport.updated_at).toLocaleString() : 'N/A'}
                                        </div>
                                    </div>
                                </div>

                                {/* Reporter Info */}
                                {selectedReport.user?.username && (
                                    <div className="text-sm">
                                        <span className="text-gray-500 text-xs font-medium uppercase tracking-wide flex items-center gap-1">
                                            <User className="h-3 w-3" />
                                            Submitted By
                                        </span>
                                        <div className="font-medium text-gray-900 mt-1">
                                            {selectedReport.user.username}
                                        </div>
                                    </div>
                                )}

                                {/* User ID */}
                                <div className="text-sm">
                                    <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">
                                        User ID
                                    </span>
                                    <div className="font-medium text-gray-900 mt-1">
                                        {selectedReport.user_id}
                                    </div>
                                </div>

                                {/* Category Info */}
                                <div className="text-sm">
                                    <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">
                                        Category
                                    </span>
                                    <div className="font-medium text-gray-900 mt-1">
                                        {selectedReport.category?.name || 'Uncategorized'}
                                    </div>
                                </div>

                                {/* Report Description */}
                                <div>
                                    <span className="text-gray-500 text-xs font-medium uppercase tracking-wide flex items-center gap-1">
                                        <FileText className="h-3 w-3" />
                                        Description
                                    </span>
                                    <div className="mt-2 p-4 bg-gray-50 rounded-lg whitespace-pre-wrap text-gray-700 border border-gray-200">
                                        {selectedReport.description}
                                    </div>
                                </div>

                                {/* Evidence/Attachment */}
                                {selectedReport.attachments && (
                                    <div>
                                        <span className="text-gray-500 text-xs font-medium uppercase tracking-wide flex items-center gap-1">
                                            <Paperclip className="h-3 w-3" />
                                            Attachment
                                        </span>
                                        <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-300">
                                                        {selectedReport.attachment_mime?.startsWith('image/') ? (
                                                            <span className="text-blue-600">🖼️</span>
                                                        ) : selectedReport.attachment_mime === 'application/pdf' ? (
                                                            <span className="text-red-600">📄</span>
                                                        ) : (
                                                            <span className="text-gray-600">📎</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm text-gray-900">
                                                            {selectedReport.attachment_name || 'Attachment'}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {selectedReport.attachment_mime || 'File'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <a 
                                                    href={selectedReport.attachments} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="px-4 py-2 bg-red-900 text-white rounded-lg hover:bg-red-800 transition-colors text-sm font-medium"
                                                >
                                                    View
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                                <Button 
                                    variant="outline" 
                                    onClick={closeDetailsModal}
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