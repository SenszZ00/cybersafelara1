import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { admin_reports } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { User, Users } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Submitted Reports',
        href: admin_reports().url,
    },
];

interface Report {
    report_id: number;
    incident_type: string;
    description: string;
    anonymous_flag: boolean;
    user?: {
        username: string; // Changed from name to username
    };
    it_personnel?: {
        username: string; // Changed from name to username
    };
    status: {
        name: string;
    };
    created_at: string;
}

interface ITPersonnel {
    id: number;
    username: string; // Changed from name to username
}

export default function SubmittedReports({ reports: initialReports, itPersonnel }: { reports: any[], itPersonnel: ITPersonnel[] }) {
    const [reports, setReports] = useState<Report[]>(initialReports);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

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
                // Update local state
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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'under review': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Submitted Reports" />
            <div className="flex flex-col gap-4 p-4">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Submitted Reports</h2>
                    <div className="text-sm text-gray-500">
                        {reports.length} reports total
                    </div>
                </div>

                {/* Reports Table */}
                <div className="overflow-x-auto rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                    <table className="min-w-full table-auto text-sm text-left text-gray-200">
                        <thead className="bg-gray-800 text-gray-100">
                            <tr>
                                <th className="px-4 py-3">Report ID</th>
                                <th className="px-4 py-3">Incident Type</th>
                                <th className="px-4 py-3">Submitted By</th>
                                <th className="px-4 py-3">Assigned To</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Submitted</th>
                                <th className="px-4 py-3 text-center">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="bg-gray-900">
                            {reports && reports.length > 0 ? (
                                reports.map((report) => (
                                    <tr 
                                        key={report.report_id} 
                                        className="border-b border-gray-700 hover:bg-gray-800 cursor-pointer"
                                        onClick={() => openModal(report)}
                                    >
                                        <td className="px-4 py-3 font-mono">{report.report_id}</td>
                                        <td className="px-4 py-3 font-medium">{report.incident_type}</td>
                                        <td className="px-4 py-3">
                                            {report.anonymous_flag ? 'Anonymous' : report.user?.username}
                                        </td>
                                        <td className="px-4 py-3">
                                            {report.it_personnel?.username || 'Unassigned'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status.name)}`}>
                                                {report.status.name}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {new Date(report.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                                            {/* Assign Dropdown - Only show for unassigned reports */}
                                            {!report.it_personnel && (
                                                <Select
                                                    onValueChange={(value) => handleAssignReport(report.report_id, parseInt(value))}
                                                >
                                                    <SelectTrigger className="w-32 h-8 text-xs">
                                                        <SelectValue placeholder="Assign" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {itPersonnel.map((person) => (
                                                            <SelectItem key={person.id} value={String(person.id)}>
                                                                <div className="flex items-center gap-2">
                                                                    <User className="h-3 w-3" />
                                                                    {person.username}
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="text-center py-6 text-gray-400">
                                        No reports found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Report Details Modal */}
                {isModalOpen && selectedReport && (
                    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50">
                        <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl">
                            {/* Header */}
                            <div className="flex justify-between items-center p-6 border-b border-gray-700">
                                <div>
                                    <h3 className="text-lg font-semibold">{selectedReport.incident_type}</h3>
                                    <p className="text-sm text-gray-400">Report #{selectedReport.report_id}</p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={closeModal}
                                    className="h-8 w-8 p-0 hover:bg-gray-800"
                                >
                                    ✕
                                </Button>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-6">
                                {/* Report Metadata */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-400">Status:</span>
                                        <div className="font-medium">
                                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedReport.status.name)}`}>
                                                {selectedReport.status.name}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Submitted:</span>
                                        <div className="font-medium">
                                            {new Date(selectedReport.created_at).toLocaleString()}
                                        </div>
                                    </div>
                                    <div>
                                        <span className="text-gray-400">Anonymous:</span>
                                        <div className="font-medium">
                                            {selectedReport.anonymous_flag ? 'Yes' : 'No'}
                                        </div>
                                    </div>
                                </div>

                                {/* Reporter Info */}
                                {!selectedReport.anonymous_flag && (
                                    <div className="text-sm">
                                        <span className="text-gray-400">Submitted By:</span>
                                        <div className="font-medium">
                                            {selectedReport.user?.username}
                                        </div>
                                    </div>
                                )}

                                {/* Assignment Section */}
                                <div className="text-sm">
                                    <span className="text-gray-400">Assigned To:</span>
                                    <div className="mt-2">
                                        {selectedReport.it_personnel ? (
                                            <div className="flex items-center gap-2 p-3 bg-gray-800 rounded-lg">
                                                <Users className="h-4 w-4" />
                                                <span className="font-medium">
                                                    {selectedReport.it_personnel.username}
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <p className="text-gray-400">This report is not assigned yet.</p>
                                                <Select
                                                    onValueChange={(value) => handleAssignReport(selectedReport.report_id, parseInt(value))}
                                                >
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Select IT personnel to assign..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {itPersonnel.map((person) => (
                                                            <SelectItem key={person.id} value={String(person.id)}>
                                                                <div className="flex items-center gap-2">
                                                                    <User className="h-3 w-3" />
                                                                    {person.username}
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Report Description */}
                                <div>
                                    <span className="text-gray-400 text-sm">Description:</span>
                                    <div className="mt-2 p-4 bg-gray-800 rounded-lg whitespace-pre-wrap">
                                        {selectedReport.description}
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex justify-end gap-3 p-6 border-t border-gray-700">
                                <Button variant="outline" onClick={closeModal}>
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