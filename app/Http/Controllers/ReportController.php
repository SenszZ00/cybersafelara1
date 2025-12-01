<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\ReportLog;
use App\Http\Requests\StoreReportRequest;
use App\Http\Requests\UpdateReportRequest;
use App\Models\ReportStatus;

class ReportController extends Controller
{
    public function index()
    {
        //
    }

    public function create()
    {
        //
    }

    /**
     * Store a newly created report.
     */
    public function store(StoreReportRequest $request)
{
    $report = Report::create([
        'user_id'            => auth()->id(),
        'report_category_id' => $request->report_category_id, // Changed from incident_type
        'description'        => $request->description,
        'anonymous_flag'     => $request->anonymous_flag ?? false,
        'attachment_mime'    => null, // Handle file uploads later
        'attachment_name'    => null,
        'attachment_path'    => null,
        'report_status_id'   => 1,
        'it_personnel_id'    => null, // Will be auto-assigned
    ]);

        // Log entry in report_logs
        ReportLog::create([
            'report_id'         => $report->report_id,
            'it_personnel_id'   => null, // no IT assigned yet
            'incident_type'     => $report->incident_type,
            'status'            => 'pending', // initial status
            'resolution_details'=> 'Report submitted by user.',
        ]);

        return back()->with('success', 'Report successfully submitted.');
    }

    /**
     * Update the specified report.
     */
    
    public function show(Report $report)
    {
        //
    }

    public function edit(Report $report)
    {
        //
    }

    public function destroy(Report $report)
    {
        //
    }

    /**
     * Fetch reports assigned to the logged-in IT personnel
     */
    public function assignedReports()
{
    $user = auth()->user();

    // DEBUG
    \Log::info('🔵 FETCHING ASSIGNED REPORTS', ['it_personnel_id' => $user->id]);

    // Fetch reports with related status
    $reports = Report::where('it_personnel_id', $user->id)
        ->with('status')
        ->latest()
        ->get([
            'report_id',
            'user_id',
            'incident_type',
            'description',
            'attachments',
            'created_at',
            'report_status_id',
        ]);

        // Fetch all status options for dropdown
        $statuses = ReportStatus::all(['id', 'name']);

        return inertia('it/it-reports', [
            'reports'  => $reports,
            'statuses' => $statuses,
        ]);
    }
}