import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { admin_reports } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { User, Users, X, ChevronLeft, ChevronRight } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Submitted Reports',
        href: admin_reports().url,
    },
];

interface Report {
    report_id: number;
    description: string;
    anonymous_flag: boolean;
    category: {
        name: string;
    };
    user?: {
        username: string;
    };
    it_personnel?: {
        id: number;
        username: string;
    };
    status: {
        name: string;
    };
    created_at: string;
}

interface ITPersonnel {
    id: number;
    username: string;
}

interface PaginationProps {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

export default function SubmittedReports({ 
    reports: initialReports, 
    itPersonnel,
    pagination 
}: { 
    reports: any[], 
    itPersonnel: ITPersonnel[],
    pagination: PaginationProps 
}) {
    const [reports, setReports] = useState<Report[]>(initialReports);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Add useEffect to update reports when initialReports changes (on page navigation)
    useEffect(() => {
        setReports(initialReports);
    }, [initialReports]);

    const openModal = (report: Report) => {
        setSelectedReport(report);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedReport(null);
    };

    const handleAssignReport = (reportId: number, personnelId: number) => {
        router.post('/admin/reports/assign', {
            report_id: reportId,
            it_personnel_id: personnelId
        }, {
            onSuccess: () => {
                setReports(reports.map(report => 
                    report.report_id === reportId 
                        ? { 
                            ...report, 
                            it_personnel: itPersonnel.find(p => p.id === personnelId)
                          }
                        : report
                ));
                closeModal();
            }
        });
    };

    const handleUnassignReport = (reportId: number) => {
        router.post('/admin/reports/assign', {
            report_id: reportId,
            it_personnel_id: null
        }, {
            onSuccess: () => {
                setReports(reports.map(report => 
                    report.report_id === reportId 
                        ? { 
                            ...report, 
                            it_personnel: undefined
                          }
                        : report
                ));
                closeModal();
            }
        });
    };

    const handlePageChange = (page: number) => {
        router.get(`/admin_reports?page=${page}`, {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onSuccess: (page) => {
                console.log('Page changed successfully to:', page);
            },
            onError: (errors) => {
                console.error('Error changing page:', errors);
            }
        });
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'resolved': return 'bg-green-100 text-green-800';
            case 'under review': return 'bg-blue-100 text-blue-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Submitted Reports" />
            <div className="flex flex-col gap-6 p-6 bg-white">

                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Submitted Reports</h2>
                        {pagination && (
                            <p className="text-sm text-gray-600 mt-1">
                                Showing  <span className="font-bold">{pagination.from}</span>  -  <span className="font-bold">{pagination.to}</span>  of  <span className="font-bold">{pagination.total}</span>  results
                            </p>
                        )}
                    </div>
                    {/* <div className="text-sm text-gray-500">
                        {pagination?.total || reports.length} reports total
                    </div> */}
                </div>

                {/* Reports Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left">
                        <thead>
                            <tr className="bg-[#770000] text-white">
                                <th className="px-6 py-4 font-semibold">Report ID</th>
                                <th className="px-6 py-4 font-semibold">Category</th>
                                <th className="px-6 py-4 font-semibold">Submitted By</th>
                                <th className="px-6 py-4 font-semibold">Assigned To</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold">Submitted</th>
                                <th className="px-6 py-4 font-semibold text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody>
                            {reports && reports.length > 0 ? (
                                reports.map((report) => (
                                    <tr 
                                        key={report.report_id} 
                                        className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                                        onClick={() => openModal(report)}
                                    >
                                        <td className="px-6 py-4 font-mono text-gray-900">{report.report_id}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{report.category.name}</td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {report.anonymous_flag ? 'Anonymous' : report.user?.username}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {report.it_personnel?.username || 'Unassigned'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status.name)}`}>
                                                {report.status.name}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {new Date(report.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                                            {/* Assign/Reassign Dropdown - Always show for admin */}
                                            <div className="flex gap-2 justify-center">
                                                <Select
                                                    value={report.it_personnel ? String(report.it_personnel.id) : ''}
                                                    onValueChange={(value) => {
                                                        if (value === 'unassign') {
                                                            handleUnassignReport(report.report_id);
                                                        } else {
                                                            handleAssignReport(report.report_id, parseInt(value));
                                                        }
                                                    }}
                                                >
                                                    <SelectTrigger className="w-40 h-8 text-xs border-gray-300 focus:border-[#992426] focus:ring-[#992426]">
                                                        <SelectValue placeholder="Assign" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-white border-gray-300">
                                                        <SelectItem value="unassign" className="text-red-600 focus:bg-red-50">
                                                            <div className="flex items-center gap-2">
                                                                Unassign
                                                            </div>
                                                        </SelectItem>
                                                        {itPersonnel.map((person) => (
                                                            <SelectItem key={person.id} value={String(person.id)} className="text-gray-700 focus:bg-gray-100">
                                                                <div className="flex items-center gap-2">
                                                                    <User className="h-3 w-3" />
                                                                    {person.username}
                                                                    {report.it_personnel?.id === person.id && ' (Current)'}
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="text-center py-12 text-gray-500">
                                        No reports found.
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

                {/* Report Details Modal */}
                {isModalOpen && selectedReport && (
                    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 shadow-2xl">
                            {/* Header */}
                            <div className="flex justify-between items-center p-6 border-b border-gray-200">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{selectedReport.category.name}</h3>
                                    <p className="text-sm text-gray-500">Report #{selectedReport.report_id}</p>
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
                                {/* Report Metadata */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
                                    <div>
                                        <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">Status</span>
                                        <div className="font-medium text-gray-900 mt-1">
                                            <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(selectedReport.status.name)}`}>
                                                {selectedReport.status.name}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">Submitted</span>
                                        <div className="font-medium text-gray-900 mt-1">
                                            {new Date(selectedReport.created_at).toLocaleString()}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">Anonymous</span>
                                        <div className="font-medium text-gray-900 mt-1">
                                            {selectedReport.anonymous_flag ? 'Yes' : 'No'}
                                        </div>
                                    </div>
                                </div>

                                {/* Reporter Info */}
                                {!selectedReport.anonymous_flag && (
                                    <div className="text-sm">
                                        <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">Submitted By</span>
                                        <div className="font-medium text-gray-900 mt-1">
                                            {selectedReport.user?.username}
                                        </div>
                                    </div>
                                )}

                                {/* Assignment Section */}
                                <div className="text-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">Assigned To</span>
                                    </div>
                                    <div className="mt-2 space-y-3">
                                        {selectedReport.it_personnel ? (
                                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-4 w-4 text-gray-600" />
                                                    <span className="font-medium text-gray-900">
                                                        {selectedReport.it_personnel.username}
                                                    </span>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleUnassignReport(selectedReport.report_id)}
                                                    className="border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800"
                                                >
                                                    Unassign
                                                </Button>
                                            </div>
                                        ) : (
                                            <p className="text-gray-500">This report is not assigned yet.</p>
                                        )}
                                        
                                        <Select
                                            onValueChange={(value) => {
                                                if (value === 'unassign') {
                                                    handleUnassignReport(selectedReport.report_id);
                                                } else {
                                                    handleAssignReport(selectedReport.report_id, parseInt(value));
                                                }
                                            }}
                                        >
                                            <SelectTrigger className="w-full border-gray-300 focus:border-[#992426] focus:ring-[#992426]">
                                                <SelectValue placeholder={
                                                    selectedReport.it_personnel 
                                                        ? "Reassign to different IT personnel..." 
                                                        : "Select IT personnel to assign..."
                                                } />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white border-gray-300">
                                                {selectedReport.it_personnel && (
                                                    <SelectItem value="unassign" className="text-red-600 focus:bg-red-50">
                                                        <div className="flex items-center gap-2">
                                                            Unassign Current Personnel
                                                        </div>
                                                    </SelectItem>
                                                )}
                                                {itPersonnel.map((person) => (
                                                    <SelectItem 
                                                        key={person.id} 
                                                        value={String(person.id)}
                                                        disabled={selectedReport.it_personnel?.id === person.id}
                                                        className="text-gray-700 focus:bg-gray-100"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <User className="h-3 w-3" />
                                                            {person.username}
                                                            {selectedReport.it_personnel?.id === person.id && ' (Current)'}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Report Description */}
                                <div>
                                    <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">Description</span>
                                    <div className="mt-2 p-4 bg-gray-50 rounded-lg whitespace-pre-wrap text-gray-700 border border-gray-200">
                                        {selectedReport.description}
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