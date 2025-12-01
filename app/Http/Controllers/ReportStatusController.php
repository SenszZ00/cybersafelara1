<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\ReportLog;
use App\Models\ReportStatus; // Add this import
use Illuminate\Http\Request;

class ReportStatusController extends Controller
{
    /**
     * Update the status of a report.
     */
    public function update(Request $request, $reportId)
{
    // Validate the request
    $request->validate([
        'report_status_id' => 'required|exists:report_statuses,id',
        'resolution_details' => 'sometimes|string|nullable|max:1000',
    ]);

    // Find the report
    $report = Report::findOrFail($reportId);

    // Check if the authenticated IT personnel is assigned
    if ($report->it_personnel_id !== auth()->id()) {
        abort(403, 'Unauthorized action.');
    }

    // Save old status for logging
    $oldStatusId = $report->report_status_id;
    $oldStatusName = $report->status?->name ?? 'Unknown';

    // Update report's status
    $report->report_status_id = $request->report_status_id;
    $report->save();

    // Refresh to get the new status relationship
    $report->refresh();

    // Get current status name safely
    $currentStatusName = $report->status?->name ?? 'Unknown';

    // Use custom resolution details if provided, otherwise use status names
    $resolutionDetails = $request->resolution_details;
    if (!empty($resolutionDetails)) {
        $logMessage = $resolutionDetails;
    } else {
        $logMessage = "Status changed from {$oldStatusName} to {$currentStatusName}";
    }

    // ✅ FIX: Use report_category_id instead of incident_type
    ReportLog::create([
        'report_id'           => $report->report_id,
        'it_personnel_id'     => auth()->id(),
        'report_category_id'  => $report->report_category_id, // ✅ CHANGED
        'status'              => $currentStatusName,
        'resolution_details'  => $logMessage,
    ]);

    return back()->with('success', 'Report status updated successfully.');
}
}