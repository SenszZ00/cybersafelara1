<?php

namespace App\Http\Controllers;

use App\Models\ReportLog;
use Inertia\Inertia;
use Illuminate\Http\Request;

class AdminReportLogController extends Controller
{
    /**
     * Display all report logs for admin
     */
    public function index(Request $request)
    {
        // Debug: Check if we're reaching this method
        \Log::info('AdminReportLogController index method called');

        // Get all report logs with relationships
        $logs = ReportLog::with([
            'report:id,report_id',
            'category:id,name',
            'user:id,username' // IT personnel info
        ])
        ->latest()
        ->paginate(20); // Paginate with 20 items per page

        // Transform the paginated data
        $logs->getCollection()->transform(function ($log) {
            return [
                'log_id' => $log->log_id,
                'report_id' => $log->report_id,
                'report_category_id' => $log->report_category_id,
                'resolution_details' => $log->resolution_details,
                'timestamp' => $log->created_at, // Use created_at as timestamp
                'status' => $log->status,
                'category' => $log->category ? [
                    'id' => $log->category->id,
                    'name' => $log->category->name,
                ] : null,
                'it_personnel' => $log->user ? [
                    'id' => $log->user->id,
                    'username' => $log->user->username,
                ] : null,
            ];
        });

        // Debug: Check final data being sent
        \Log::info('Admin Report Logs data being sent to frontend:', [
            'logs_count' => $logs->count(),
            'pagination_data' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total(),
                'from' => $logs->firstItem(),
                'to' => $logs->lastItem(),
            ],
            'first_log' => $logs->first(),
        ]);

        return Inertia::render('admin/admin_report_log', [
            'logs' => $logs->items(), // Use items() for the transformed collection
            'pagination' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total(),
                'from' => $logs->firstItem(),
                'to' => $logs->lastItem(),
            ]
        ]);
    }

    /**
     * Filter report logs based on criteria
     */
    public function filter(Request $request)
    {
        $query = ReportLog::with([
            'report:id,report_id',
            'category:id,name',
            'user:id,username'
        ]);

        // Apply filters if provided
        if ($request->has('report_id') && $request->report_id) {
            $query->where('report_id', $request->report_id);
        }

        if ($request->has('category_id') && $request->category_id) {
            $query->where('report_category_id', $request->category_id);
        }

        if ($request->has('it_personnel_id') && $request->it_personnel_id) {
            $query->where('it_personnel_id', $request->it_personnel_id);
        }

        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        if ($request->has('date_from') && $request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->has('date_to') && $request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $logs = $query->latest()->paginate(20);

        // Transform the data
        $logs->getCollection()->transform(function ($log) {
            return [
                'log_id' => $log->log_id,
                'report_id' => $log->report_id,
                'report_category_id' => $log->report_category_id,
                'resolution_details' => $log->resolution_details,
                'timestamp' => $log->created_at,
                'status' => $log->status,
                'category' => $log->category ? [
                    'id' => $log->category->id,
                    'name' => $log->category->name,
                ] : null,
                'it_personnel' => $log->user ? [
                    'id' => $log->user->id,
                    'username' => $log->user->username,
                ] : null,
            ];
        });

        return response()->json([
            'logs' => $logs->items(),
            'pagination' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total(),
                'from' => $logs->firstItem(),
                'to' => $logs->lastItem(),
            ]
        ]);
    }

    /**
     * Show a specific report log
     */
    public function show($id)
    {
        $log = ReportLog::with([
            'report:id,report_id,description',
            'category:id,name',
            'user:id,username,email'
        ])->findOrFail($id);

        return Inertia::render('admin/report-log-detail', [
            'log' => [
                'log_id' => $log->log_id,
                'report_id' => $log->report_id,
                'report' => [
                    'id' => $log->report->report_id,
                    'description' => $log->report->description,
                ],
                'report_category_id' => $log->report_category_id,
                'resolution_details' => $log->resolution_details,
                'timestamp' => $log->created_at,
                'status' => $log->status,
                'category' => $log->category ? [
                    'id' => $log->category->id,
                    'name' => $log->category->name,
                ] : null,
                'it_personnel' => $log->user ? [
                    'id' => $log->user->id,
                    'username' => $log->user->username,
                    'email' => $log->user->email,
                ] : null,
            ]
        ]);
    }
}