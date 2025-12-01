<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\ReportLog;

class AdminReportController extends Controller
{
    public function index(Request $request)
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

        // Get all reports with relationships - ADD PAGINATION HERE
        $reports = Report::with([
            'user:id,username,college_department_id',
            'itPersonnel:id,username,college_department_id',  
            'status:id,name',
            'category:id,name' 
        ])
            ->latest()
            ->paginate(20); // Changed from get() to paginate(20)

        // Transform the paginated data
        $reports->getCollection()->transform(function ($report) {
            return [
                'report_id' => $report->report_id,
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
            'pagination_data' => [
                'current_page' => $reports->currentPage(),
                'last_page' => $reports->lastPage(),
                'per_page' => $reports->perPage(),
                'total' => $reports->total(),
                'from' => $reports->firstItem(),
                'to' => $reports->lastItem(),
            ],
            'first_report' => $reports->first(),
            'first_it_personnel' => $itPersonnel->first(),
        ]);

        return Inertia::render('admin/admin_reports', [
            'reports' => $reports->items(), // Use items() instead of the collection
            'itPersonnel' => $itPersonnel,
            'pagination' => [ // Add pagination data
                'current_page' => $reports->currentPage(),
                'last_page' => $reports->lastPage(),
                'per_page' => $reports->perPage(),
                'total' => $reports->total(),
                'from' => $reports->firstItem(),
                'to' => $reports->lastItem(),
            ]
        ]);
    }

public function assign(Request $request)
{
    $validated = $request->validate([
        'report_id' => 'required|exists:reports,report_id',
        'it_personnel_id' => 'nullable|exists:users,id',
    ]);

    $report = Report::with('category')->findOrFail($validated['report_id']);
    $admin = auth()->user();
    
    // Get current assignment before update
    $previousItPersonnelId = $report->it_personnel_id;
    $previousItPersonnel = $previousItPersonnelId ? 
        User::find($previousItPersonnelId) : null;
    
    // Get new IT personnel
    $newItPersonnel = $validated['it_personnel_id'] ? 
        User::find($validated['it_personnel_id']) : null;
    
    // DEBUG: Log what's happening
    \Log::info('Admin assignment attempt:', [
        'report_id' => $report->report_id,
        'previous_it' => $previousItPersonnelId,
        'new_it' => $validated['it_personnel_id'],
        'admin' => $admin->username
    ]);
    
    // Update the report assignment
    $report->update([
        'it_personnel_id' => $validated['it_personnel_id'],
    ]);
    
    // CREATE LOG ENTRY - Use valid status values
    if ($validated['it_personnel_id'] && !$previousItPersonnelId) {
        // New assignment - Use 'pending' status
        ReportLog::create([
            'report_id' => $report->report_id,
            'it_personnel_id' => $validated['it_personnel_id'],
            'report_category_id' => $report->report_category_id,
            'status' => 'pending', // Changed from 'assigned' to 'pending'
            'resolution_details' => "Report {$report->report_id} assigned to {$newItPersonnel->username}",
        ]);
        
        \Log::info('Created assignment log:', [
            'log_created' => true,
            'message' => "Report #{$report->report_id} assigned to {$newItPersonnel->username}"
        ]);
        
    } elseif ($validated['it_personnel_id'] && $previousItPersonnelId) {
        // Reassignment - Use 'pending' status
        ReportLog::create([
            'report_id' => $report->report_id,
            'it_personnel_id' => $validated['it_personnel_id'],
            'report_category_id' => $report->report_category_id,
            'status' => 'pending', // Changed from 'reassigned' to 'pending'
            'resolution_details' => "Report {$report->report_id} reassigned from {$previousItPersonnel->username} to {$newItPersonnel->username}",
        ]);
        
        \Log::info('Created reassignment log:', [
            'log_created' => true,
            'message' => "Report #{$report->report_id} reassigned from {$previousItPersonnel->username} to {$newItPersonnel->username}"
        ]);
        
    } elseif (!$validated['it_personnel_id'] && $previousItPersonnelId) {
        // Unassignment - Use 'pending' status
        ReportLog::create([
            'report_id' => $report->report_id,
            'it_personnel_id' => null,
            'report_category_id' => $report->report_category_id,
            'status' => 'pending', // Changed from 'unassigned' to 'pending'
            'resolution_details' => "Report {$report->report_id} unassigned from {$previousItPersonnel->username}",
        ]);
        
        \Log::info('Created unassignment log:', [
            'log_created' => true,
            'message' => "Report #{$report->report_id} unassigned from {$previousItPersonnel->username}"
        ]);
    }
    
    $message = $validated['it_personnel_id']
        ? ($previousItPersonnelId ? 'Report reassigned successfully!' : 'Report assigned successfully!')
        : 'Report unassigned successfully!';

    return back()->with('success', $message);
}
}