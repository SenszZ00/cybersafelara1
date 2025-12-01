import AppLayout from '@/layouts/app-layout';
import { it_reports } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

interface Report {
    report_id: number;
    user_id: number;
    report_category_id: number; // Changed from incident_type
    description: string;
    attachments?: string | null; // Keep this for display (maps to attachment_path)
    created_at: string;
    report_status_id: number;
    status?: {
        name: string;
    };
    category?: { // ✅ NEW: Get category name from relationship
        id: number;
        name: string;
    };
}

interface StatusOption {
    id: number;
    name: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Assigned Reports',
        href: it_reports().url,
    },
];

export default function AssignedReports() {
    const { reports, statuses } = usePage().props as unknown as {
        reports: Report[];
        statuses: StatusOption[];
    };

    const [showResolutionModal, setShowResolutionModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<number | null>(null);
    const [resolutionDetails, setResolutionDetails] = useState('');
    
    // Find the "Resolved" status ID
    const resolvedStatus = statuses.find(status => status.name.toLowerCase() === 'resolved');
    const resolvedStatusId = resolvedStatus?.id;

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
        
        // Reset the dropdown to original value if user cancels
        if (selectedReport) {
            // This is tricky - we'd need to track original values
            // For now, just close the modal and let user manually change again
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Assigned Reports" />
            <div className="flex flex-col gap-4 p-4">
                <h1 className="text-2xl font-bold">Assigned Reports</h1>

                {/* Resolution Modal */}
                {showResolutionModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg w-96">
                            <h3 className="text-lg font-bold mb-4">Resolution Details</h3>
                            <p className="mb-4 text-gray-600">
                                Please provide details on how you resolved this issue:
                            </p>
                            <textarea
                                value={resolutionDetails}
                                onChange={(e) => setResolutionDetails(e.target.value)}
                                placeholder="Describe the steps taken to resolve the issue..."
                                className="w-full h-32 p-2 border border-gray-300 rounded mb-4"
                            />
                            <div className="flex gap-2 justify-end">
                                <button
                                    onClick={handleCancelResolution}
                                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleResolutionSubmit}
                                    disabled={!resolutionDetails.trim()}
                                    className="px-4 py-2 bg-red-900 text-white rounded disabled:bg-gray-400"
                                >
                                    Submit Resolution
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {reports.length === 0 ? (
                    <p className="text-gray-500">No assigned reports.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-300 rounded-lg">
                            <thead>
                                <tr className="bg-red-900 text-white">
                                    <th className="px-4 py-2 text-left">Report ID</th>
                                    <th className="px-4 py-2 text-left">User</th>
                                    <th className="px-4 py-2 text-left">Incident Type</th>
                                    <th className="px-4 py-2 text-left">Description</th>
                                    <th className="px-4 py-2 text-left">Attachments</th>
                                    <th className="px-4 py-2 text-left">Submitted</th>
                                    <th className="px-4 py-2 text-left">Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {reports.map((report) => (
                                    <tr key={report.report_id} className="border-t border-gray-200">
                                        <td className="px-4 py-2">{report.report_id}</td>
                                        <td className="px-4 py-2">{report.user_id}</td>
                                        <td className="px-4 py-2">{report.category?.name || 'Unknown Category'}</td>
                                        <td className="px-4 py-2">{report.description}</td>

                                        <td className="px-4 py-2">
                                            {report.attachments ? (
                                                <a
                                                    href={report.attachments}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-purple-600 underline"
                                                >
                                                    View
                                                </a>
                                            ) : (
                                                'None'
                                            )}
                                        </td>

                                        <td className="px-4 py-2">
                                            {new Date(report.created_at).toLocaleString()}
                                        </td>

                                        <td className="px-4 py-2">
                                            <select
                                                className="border border-gray-300 rounded px-2 py-1"
                                                value={report.report_status_id}
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
                )}
            </div>
        </AppLayout>
    );
}