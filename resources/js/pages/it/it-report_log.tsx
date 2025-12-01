import AppLayout from '@/layouts/app-layout';
import { it_report_log } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';

interface ReportLogItem {
    report_id: number;
    report_category_id: number; // ✅ Changed from incident_type
    resolution_details: string;
    timestamp: string;
    status: string;
    category?: { // ✅ NEW: Get category name from relationship
        id: number;
        name: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Report Log',
        href: it_report_log().url,
    },
];

export default function ItReportLog() {
    const { logs = [] } = usePage().props as { logs?: ReportLogItem[] };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Report Log" />

            <div className="p-4">
                <h1 className="text-2xl font-bold mb-4">Report Log</h1>

                {logs.length === 0 ? (
                    <p className="text-gray-500">No report logs found.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-300 rounded-lg">
                            <thead>
                                <tr className="bg-red-900 text-white">
                                    <th className="px-4 py-2 text-left">Report ID</th>
                                    <th className="px-4 py-2 text-left">Incident Type</th>
                                    <th className="px-4 py-2 text-left">Resolution Details</th>
                                    <th className="px-4 py-2 text-left">Timestamp</th>
                                    <th className="px-4 py-2 text-left">Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {logs.map((log, index) => (
                                    <tr key={index} className="border-t border-gray-200">
                                        <td className="px-4 py-2">{log.report_id}</td>
                                        <td className="px-4 py-2">
                                            {log.category?.name || 'Unknown Category'} {/* ✅ Changed */}
                                        </td>
                                        <td className="px-4 py-2">{log.resolution_details}</td>
                                        <td className="px-4 py-2">
                                            {new Date(log.timestamp).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-2">{log.status}</td>
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