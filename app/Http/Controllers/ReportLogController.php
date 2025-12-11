<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\ReportLog;
use App\Models\ReportStatus;
use App\Models\ReportCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ReportLogController extends Controller
{
    /**
     * Fetch paginated reports assigned to the logged-in IT personnel
     */
    public function assignedReports(Request $request)
    {
        $user = auth()->user();

        // Fetch paginated reports with related status and category
        $query = Report::where('it_personnel_id', $user->id)
            ->with([
                'status', 
                'category', 
                'user' => function($query) {
                    $query->select('id', 'username');
                }
            ]);

        // Apply filters
        if ($request->has('date') && $request->date) {
            $query->whereDate('created_at', $request->date);
        }

        if ($request->has('status') && $request->status) {
            $query->whereHas('status', function($q) use ($request) {
                $q->where('name', $request->status);
            });
        }

        if ($request->has('category') && $request->category) {
            $query->whereHas('category', function($q) use ($request) {
                $q->where('name', $request->category);
            });
        }

        $reports = $query->latest()
            ->paginate(10, [
                'report_id',
                'user_id',
                'report_category_id',
                'description',
                'attachments',
                'attachment_name',
                'attachment_mime',
                'created_at',
                'updated_at',
                'report_status_id',
                'anonymous_flag',
            ])
            ->withQueryString();

        // Transform the paginated data for Inertia
        $reports->getCollection()->transform(function ($report) {
            return [
                'report_id' => $report->report_id,
                'user_id' => $report->user_id,
                'user' => $report->user ? ['username' => $report->user->username] : null,
                'report_category_id' => $report->report_category_id,
                'description' => $report->description,
                'attachments' => $report->attachments,
                'attachment_name' => $report->attachment_name,
                'attachment_mime' => $report->attachment_mime,
                'created_at' => $report->created_at,
                'updated_at' => $report->updated_at,
                'report_status_id' => $report->report_status_id,
                'status' => $report->status ? ['name' => $report->status->name] : null,
                'category' => $report->category ? [
                    'id' => $report->category->id,
                    'name' => $report->category->name
                ] : null,
                'anonymous_flag' => $report->anonymous_flag,
            ];
        });

        // Fetch all status options for dropdown
        $statuses = ReportStatus::all(['id', 'name']);
        $categories = ReportCategory::select('id', 'name')->get();

        return Inertia::render('it/it-reports', [
            'reports'  => $reports,
            'statuses' => $statuses,
            'categories' => $categories,
        ]);
    }

    /**
     * Display paginated report logs for the logged-in IT personnel
     */
    public function index(Request $request)
    {
        $itPersonnelId = Auth::id();
        $perPage = $request->get('per_page', 10); // Default to 10 items per page

        // Auto-create log entries for reports without logs
        $reportsWithoutLogs = Report::where('it_personnel_id', $itPersonnelId)
            ->whereDoesntHave('logs')
            ->get();

        foreach ($reportsWithoutLogs as $report) {
            ReportLog::create([
                'report_id' => $report->report_id,
                'it_personnel_id' => $itPersonnelId,
                'report_category_id' => $report->report_category_id,
                'status' => $report->status->name ?? 'pending',
                'resolution_details' => 'Report assigned to IT personnel.',
            ]);
        }

        // Fetch paginated logs with related data
        $query = ReportLog::with([
                'report' => function($query) {
                    $query->select('report_id', 'user_id', 'description', 'created_at');
                    $query->with('user:id,username');
                },
                'category' => function($query) {
                    $query->select('id', 'name');
                }
            ])
            ->whereHas('report', function ($query) use ($itPersonnelId) {
                $query->where('it_personnel_id', $itPersonnelId);
            });

        // Apply filters
        if ($request->has('date') && $request->date) {
            $query->whereDate('created_at', $request->date);
        }

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        if ($request->has('category') && $request->category) {
            $query->whereHas('category', function($q) use ($request) {
                $q->where('name', $request->category);
            });
        }

        $logs = $query->orderBy('created_at', 'desc')->paginate($perPage)->withQueryString();

        // Transform the paginated data
        $logs->getCollection()->transform(function ($log) {
            return [
                'report_id' => $log->report_id,
                'report_category_id' => $log->report_category_id,
                'resolution_details' => $log->resolution_details ?? '',
                'timestamp' => $log->created_at,
                'status' => $log->status,
                'category' => $log->category ? [
                    'id' => $log->category->id,
                    'name' => $log->category->name,
                ] : null,
                'user' => $log->report->user ? [
                    'username' => $log->report->user->username
                ] : null,
                'user_id' => $log->report->user_id,
                'description' => $log->report->description,
                'created_at' => $log->report->created_at,
            ];
        });

        // Get all statuses and categories for filter dropdowns
        $statuses = ReportStatus::select('id', 'name')->get();
        $categories = ReportCategory::select('id', 'name')->get();

        return Inertia::render('it/it-report_log', [
            'logs' => $logs,
            'statuses' => $statuses,
            'categories' => $categories,
        ]);
    }

    // ... other empty methods if needed
}