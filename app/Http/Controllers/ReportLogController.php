<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\ReportLog;
use App\Models\ReportStatus;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ReportLogController extends Controller
{
    /**
     * Fetch reports assigned to the logged-in IT personnel
     */
    public function assignedReports()
    {
        $user = auth()->user();

        $reports = Report::where('it_personnel_id', $user->id)
            ->with('status')
            ->with('category') // ✅ ADD THIS
            ->latest()
            ->get([
                'report_id',
                'user_id',
                'report_category_id', // ✅ CHANGED from incident_type
                'description',
                'attachment_path', // ✅ CHANGED from attachments
                'created_at',
                'report_status_id',
            ]);

        $statuses = ReportStatus::all(['id', 'name']);

        return Inertia::render('it/it-reports', [
            'reports'  => $reports,
            'statuses' => $statuses,
        ]);
    }

    /**
     * Display report logs for the logged-in IT personnel
     */
    public function index()
    {
        $itPersonnelId = Auth::id();

        // ✅ UPDATED AUTO-LOG: Check for assigned reports without log entries
        $reportsWithoutLogs = Report::where('it_personnel_id', $itPersonnelId)
            ->whereDoesntHave('logs') // ✅ SIMPLIFIED
            ->get();

        // Create log entries for reports that don't have any
        foreach ($reportsWithoutLogs as $report) {
            ReportLog::create([
                'report_id'         => $report->report_id,
                'it_personnel_id'   => $itPersonnelId,
                'report_category_id'=> $report->report_category_id, // ✅ CHANGED
                'status'            => 'pending',
                'resolution_details'=> 'Report assigned to IT personnel.',
            ]);
            
            \Log::info("Auto-created log entry for report {$report->report_id}");
        }

        // Then fetch all logs (including the newly created ones) with category
        $logs = ReportLog::with(['report', 'category']) // ✅ ADD 'category'
            ->whereHas('report', function ($query) use ($itPersonnelId) {
                $query->where('it_personnel_id', $itPersonnelId);
            })
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($log) {
                return [
                    'report_id'         => $log->report->report_id,
                    'report_category_id'=> $log->report_category_id,
                    'resolution_details'=> $log->resolution_details ?? '',
                    'timestamp'         => $log->created_at,
                    'status'            => $log->status,
                    'category'          => [ // ✅ ADD category data for frontend
                        'id' => $log->category->id,
                        'name' => $log->category->name,
                    ],
                ];
            });

        return Inertia::render('it/it-report_log', [
            'logs' => $logs,
        ]);
    }

    // ... other empty methods
}