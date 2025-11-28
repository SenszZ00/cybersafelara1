<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Http\Request;

class AdminReportController extends Controller
{
    public function index()
    {
        // Debug: Check if we're reaching this method
        \Log::info('AdminReportController index method called');
       
        // Debug: Check what data we have
        $reportsCount = Report::count();
        $itPersonnelCount = User::where('role', 'it')->count();
       
        \Log::info('Data counts:', [
            'reports' => $reportsCount,
            'it_personnel' => $itPersonnelCount
        ]);

        // Get all reports with relationships - ADD CATEGORY RELATIONSHIP
        $reports = Report::with([
            'user:id,username,college_department_id',
            'itPersonnel:id,username,college_department_id',  
            'status:id,name',
            'category:id,name' // ADD THIS LINE
        ])
            ->latest()
            ->get()
            ->map(function ($report) {
                return [
                    'report_id' => $report->report_id,
                    // REPLACE incident_type with category
                    'category' => [
                        'name' => $report->category->name,
                    ],
                    'description' => $report->description,
                    'anonymous_flag' => $report->anonymous_flag,
                    'user' => $report->user ? [
                        'username' => $report->user->username,
                    ] : null,
                    'it_personnel' => $report->itPersonnel ? [
                        'id' => $report->itPersonnel->id,
                        'username' => $report->itPersonnel->username,
                    ] : null,
                    'status' => [
                        'name' => $report->status->name,
                    ],
                    'created_at' => $report->created_at->format('Y-m-d H:i:s'),
                ];
            });

        // Get IT personnel (users with role 'it')
        $itPersonnel = User::where('role', 'it')
            ->select('id', 'username')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'username' => $user->username,
                ];
            });

        // Debug: Check final data being sent
        \Log::info('Final data being sent to frontend:', [
            'reports_count' => $reports->count(),
            'it_personnel_count' => $itPersonnel->count(),
            'first_report' => $reports->first(),
            'first_it_personnel' => $itPersonnel->first(),
        ]);

        return Inertia::render('admin/admin_reports', [
            'reports' => $reports,
            'itPersonnel' => $itPersonnel,
        ]);
    }

    public function assign(Request $request)
    {
        $validated = $request->validate([
            'report_id' => 'required|exists:reports,report_id',
            'it_personnel_id' => 'nullable|exists:users,id',
        ]);

        $report = Report::findOrFail($validated['report_id']);
       
        // ONLY update the assignment, NOT the status
        $report->update([
            'it_personnel_id' => $validated['it_personnel_id'],
            // Remove the status update - let IT personnel handle status changes
        ]);

        $message = $validated['it_personnel_id']
            ? 'Report assigned successfully!'
            : 'Report unassigned successfully!';

        return back()->with('success', $message);
    }
}