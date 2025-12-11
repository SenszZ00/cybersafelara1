import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { type BreadcrumbItem } from '@/types';
import { X, FileText, Calendar, AlertCircle, Paperclip, ChevronLeft, ChevronRight, Clock, Trash2 } from 'lucide-react';
import ReportFilter from '@/components/report-filter';

interface Report {
  report_id: number;
  report_category_id?: number;
  description?: string;
  anonymous_flag?: boolean;
  user?: { username?: string };
  status?: { name?: string };
  created_at?: string;
  incident_date?: string;
  category?: { name?: string };
  attachment_path?: string;
  attachment_name?: string;
  attachment_mime?: string;
  updated_at?: string;
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

type PageProps = {
  reports: {
    data: Report[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
  statuses?: Option[];
  categories?: Option[];
};

function hasPageProps(props: any): props is PageProps {
  return props && props.reports && Array.isArray(props.reports.data);
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'My Reports', href: '/my_reports' },
];

export default function MyReports() {
  const page = usePage();
  const props = page.props;
  
  const reportsData = hasPageProps(props) ? props.reports : { 
    data: [], 
    current_page: 1, 
    last_page: 1, 
    per_page: 20, 
    total: 0, 
    from: 0, 
    to: 0 
  };
  
  const statuses = hasPageProps(props) ? (props.statuses || []) : [];
  const categories = hasPageProps(props) ? (props.categories || []) : [];
  
  const reports: Report[] = reportsData.data;
  const pagination: PaginationData = {
    current_page: reportsData.current_page,
    last_page: reportsData.last_page,
    per_page: reportsData.per_page,
    total: reportsData.total,
    from: reportsData.from,
    to: reportsData.to,
  };
  
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(pagination.current_page);
  const [reportToDelete, setReportToDelete] = useState<Report | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const openModal = (report: Report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedReport(null);
  };

  const handlePageChange = (pageNum: number) => {
    if (pageNum < 1 || pageNum > pagination.last_page) return;
    
    setCurrentPage(pageNum);
    router.get(`/my_reports?page=${pageNum}`, {}, {
      preserveState: true,
      preserveScroll: true,
      replace: true,
    });
  };

  const handleDeleteClick = (e: React.MouseEvent, report: Report) => {
    e.stopPropagation(); // Prevent opening the modal
    setReportToDelete(report);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!reportToDelete) return;
    
    setIsDeleting(true);
    
    try {
      await router.delete(`/user/reports/${reportToDelete.report_id}`, {
        preserveScroll: true,
        onSuccess: () => {
          setIsDeleteConfirmOpen(false);
          setReportToDelete(null);
          setIsDeleting(false);
        },
        onError: () => {
          setIsDeleting(false);
          alert('Failed to delete report. Please try again.');
        },
      });
    } catch (error) {
      setIsDeleting(false);
      console.error('Delete error:', error);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteConfirmOpen(false);
    setReportToDelete(null);
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status?.toLowerCase()) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'in progress': 
      case 'under review': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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

  // Function to format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="My Reports" />
      
      <div className="flex flex-col gap-6 p-6 bg-white">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Reports</h1>
            {pagination && (
              <p className="text-sm text-gray-600 mt-1">
                Showing <span className="font-bold">{pagination.from}</span> - <span className="font-bold">{pagination.to}</span> of <span className="font-bold">{pagination.total}</span> results
              </p>
            )}
          </div>
          <Link href="/user/user_submit_report">
            <Button className="bg-red-900 hover:bg-red-800 text-white px-6 py-2">
              Submit Report
            </Button>
          </Link>
        </div>

        {/* Filter Section */}
        <ReportFilter 
          statuses={statuses} 
          categories={categories}
          className="border-t pt-4"
        />

        {/* Reports Table */}
        {reports.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No reports submitted yet.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead>
                  <tr className="bg-red-900 text-white">
                    <th className="px-6 py-4 font-semibold">Report ID</th>
                    <th className="px-6 py-4 font-semibold">Category</th>
                    <th className="px-6 py-4 font-semibold">Description</th>
                    <th className="px-6 py-4 font-semibold">Date Submitted</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Attachment</th>
                    <th className="px-6 py-4 font-semibold"> </th>
                  </tr>
                </thead>

                <tbody>
                  {reports.map((report) => (
                    <tr 
                      key={report.report_id} 
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors group"
                    >
                      <td 
                        className="px-6 py-4 font-mono text-gray-900 cursor-pointer"
                        onClick={() => openModal(report)}
                      >
                        {report.report_id}
                      </td>
                      <td 
                        className="px-6 py-4 font-medium text-gray-900 cursor-pointer"
                        onClick={() => openModal(report)}
                      >
                        {report.category?.name || 'Uncategorized'}
                      </td>
                      <td 
                        className="px-6 py-4 text-gray-600 max-w-md truncate cursor-pointer"
                        onClick={() => openModal(report)}
                      >
                        {report.description || 'No description'}
                      </td>
                      <td 
                        className="px-6 py-4 text-gray-600 cursor-pointer"
                        onClick={() => openModal(report)}
                      >
                        {report.created_at ? new Date(report.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td 
                        className="px-6 py-4 cursor-pointer"
                        onClick={() => openModal(report)}
                      >
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status?.name)}`}>
                          {report.status?.name || 'Pending'}
                        </span>
                      </td>
                      <td 
                        className="px-6 py-4 text-gray-600 cursor-pointer"
                        onClick={() => openModal(report)}
                      >
                        {report.attachment_path ? 'Yes' : 'No'}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={(e) => handleDeleteClick(e, report)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors group-hover:bg-gray-100"
                          title="Delete Report"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
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

        {/* Report Details Modal */}
        {isModalOpen && selectedReport && (
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
                  onClick={closeModal}
                  className="h-8 w-8 p-0 hover:bg-gray-100 text-gray-500"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Report Metadata */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
                      <Clock className="h-3 w-3" />
                      Incident Date
                    </span>
                    <div className="font-medium text-gray-900 mt-1">
                      {formatDate(selectedReport.incident_date)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs font-medium uppercase tracking-wide flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Submitted
                    </span>
                    <div className="font-medium text-gray-900 mt-1">
                      {selectedReport.created_at ? new Date(selectedReport.created_at).toLocaleString() : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs font-medium uppercase tracking-wide">
                      Anonymous
                    </span>
                    <div className="font-medium text-gray-900 mt-1">
                      {selectedReport.anonymous_flag ? 'Yes' : 'No'}
                    </div>
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
                    {selectedReport.description || 'No description provided'}
                  </div>
                </div>

                {/* Evidence/Attachment */}
                {selectedReport.attachment_path && (
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
                          href={`/storage/${selectedReport.attachment_path}`} 
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
                  onClick={closeModal}
                  className="border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {isDeleteConfirmOpen && reportToDelete && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full border border-gray-200 shadow-2xl">
              {/* Header */}
              <div className="flex items-center gap-3 p-6 border-b border-gray-200">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Delete Report</h3>
                  <p className="text-sm text-gray-500">Report {reportToDelete.report_id}</p>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-gray-700">
                  Are you sure you want to delete this report? This action cannot be undone.
                </p>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-900">
                    {reportToDelete.category?.name || 'Uncategorized'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {reportToDelete.description || 'No description'}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Submitted: {reportToDelete.created_at ? new Date(reportToDelete.created_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                <Button 
                  variant="outline" 
                  onClick={handleCancelDelete}
                  className="border-gray-300 text-gray-700 hover:bg-gray-100"
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleConfirmDelete}
                  className="bg-[#770000] hover:bg-red-800 text-white"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                      Deleting...
                    </>
                  ) : (
                    'Delete Report'
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}