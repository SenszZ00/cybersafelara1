import React from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { type BreadcrumbItem } from '@/types';

/** Minimal Report interface for user-facing listing (user reports only) */
interface Report {
  report_id: number;            // primary key in your model
  incident_type?: string;       // category name or incident short text
  description?: string;
  anonymous_flag?: boolean;
  user?: { username?: string }  // reporter info (optional)
  status?: { name?: string };   // status object with name
  created_at?: string;
  // convenience UI fields (if you send them from backend)
  report_no?: string;
  title?: string;
  date?: string;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'My Reports', href: '/my_reports' },
];

export default function MyReports() {
  // get Inertia props (expects controller to send `reports` paginator)
  const { props } = usePage<Record<string, any>>();
  // Laravel paginator usually returns { data: [...], ...meta }
  const rawReports = props.reports;
  const reports: Report[] = Array.isArray(rawReports?.data) ? rawReports.data : (Array.isArray(rawReports) ? rawReports : []);

  const goTo = (id: number | string) => {
    router.get(`/user/view-report/${id}`);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="My Reports" />

      <div className="min-h-screen bg-black text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">CyberSafe USeP</h1>
            <p className="text-xl text-gray-300">Your submitted incident reports</p>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Submit Report - navigates to the submit page */}
            <div className="flex justify-end mb-6">
              <Link href="/user/user_submit_report">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold">
                  Submit Report
                </Button>
              </Link>
            </div>

            {/* Reports table */}
            <div className="bg-black border border-gray-800 rounded-xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800">
                <h2 className="text-xl font-semibold text-white">My Reports</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-black">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">#</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Report No.</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-800">
                    {reports.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No reports submitted yet.</td>
                      </tr>
                    )}

                    {reports.map((report, index) => (
                      <tr
                        key={report.report_id}
                        role="button"
                        tabIndex={0}
                        onClick={() => goTo(report.report_id)}
                        onKeyDown={(e) => { if (e.key === 'Enter') goTo(report.report_id); }}
                        className="cursor-pointer hover:bg-gray-900 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{index + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                          {report.report_no ?? `RPT-${String(report.report_id).padStart(3, '0')}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{report.date ?? (report.created_at ? report.created_at.split('T')[0] : '')}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{report.title ?? report.incident_type ?? (report.description ? report.description.slice(0, 60) + '...' : '')}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${report.status?.name === 'Resolved' ? 'bg-green-800 text-green-200' : 'bg-yellow-900 text-yellow-200'}`}>
                            {report.status?.name ?? 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* If you want server-side pagination links, you can render them here using props.reports.links */}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}