<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\ReportLog;
use App\Models\ReportStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ReportController extends Controller
{
    /**
     * Fetch paginated reports assigned to the logged-in IT personnel
     */
    public function assignedReports(Request $request)
    {
        $user = auth()->user();

        // Fetch paginated reports with related status and category
        $query = Report::where('it_personnel_id', $user->id)
            ->with(['status', 'category', 'user' => function($query) {
                $query->select('id', 'username');
            }]);

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
        $categories = \App\Models\ReportCategory::select('id', 'name')->get();

        return Inertia::render('it/it-reports', [
            'reports'  => $reports,
            'statuses' => $statuses,
            'categories' => $categories,
        ]);
    }

    /**
     * Update report status with resolution details
     */
    public function updateStatus(Request $request, $reportId)
    {
        $request->validate([
            'report_status_id' => 'required|exists:report_statuses,id',
            'resolution_details' => 'nullable|string|max:1000',
        ]);

        $report = Report::findOrFail($reportId);
        
        // Update report status
        $report->update([
            'report_status_id' => $request->report_status_id,
            'updated_at' => now(),
        ]);

        // Create a log entry for the status update
        ReportLog::create([
            'report_id' => $report->report_id,
            'it_personnel_id' => Auth::id(),
            'report_category_id' => $report->report_category_id,
            'status' => $report->status->name,
            'resolution_details' => $request->resolution_details ?: 'Status updated to ' . $report->status->name,
            'created_at' => now(),
        ]);

        return back()->with('success', 'Report status updated successfully.');
    }

    // ... other methods
}