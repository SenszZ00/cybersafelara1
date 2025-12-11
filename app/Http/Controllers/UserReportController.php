<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\ReportCategory;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class UserReportController extends Controller
{
    public function MyReports(Request $request)
    {
        $user = $request->user();

        $query = Report::where('user_id', $user->id)
            ->with(['status', 'category', 'itPersonnel']);

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

        $reports = $query->latest()->paginate(10)->withQueryString();

        // Get all statuses and categories for filter dropdowns
        $statuses = \App\Models\ReportStatus::select('id', 'name')->get();
        $categories = \App\Models\ReportCategory::select('id', 'name')->get();

        return Inertia::render('user/my_reports', [
            'reports' => $reports,
            'statuses' => $statuses,
            'categories' => $categories,
        ]);
    }

    public function submitReport(Request $request)
    {
        $categories = ReportCategory::select('id', 'name')->get();

        return Inertia::render('user/user_submit_report', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        // Start with comprehensive logging
        Log::info('🔍 ========== REPORT SUBMISSION START ==========');
        
        // Get the authenticated user
        $user = $request->user();
        Log::info('👤 SUBMITTING USER:', [
            'id' => $user->id,
            'username' => $user->username,
            'email' => $user->email,
            'role' => $user->role,
            'college_department_id' => $user->college_department_id,
            'college_department_id_type' => gettype($user->college_department_id),
            'college_department_id_is_null' => is_null($user->college_department_id),
            'college_department_id_empty' => empty($user->college_department_id),
        ]);

        // Validate the request
        $validated = $request->validate([
            'category_id' => 'required|integer|exists:report_categories,id',
            'incident_date' => 'required|date|before_or_equal:today',
            'description' => 'required|string',
            'is_anonymous' => 'sometimes|string|in:0,1',
            'evidence' => 'nullable|file|mimes:jpg,jpeg,png,pdf,doc,docx|max:10240',
        ]);

        Log::info('✅ VALIDATION PASSED:', $validated);

        // Convert is_anonymous string to boolean
        $isAnonymous = ($validated['is_anonymous'] ?? '0') === '1';
        Log::info('🎭 IS ANONYMOUS?', ['value' => $isAnonymous, 'raw' => $validated['is_anonymous'] ?? '0']);
        
        // Initialize IT personnel as null
        $itPersonnelId = null;
        
        // Only attempt assignment if NOT anonymous AND user has a college_department_id
        if (!$isAnonymous) {
            Log::info('📋 CHECKING FOR IT PERSONNEL ASSIGNMENT...');
            
            if ($user->college_department_id) {
                Log::info('🏢 User has college_department_id: ' . $user->college_department_id);
                
                // ======== DEBUG: Check all users in same department ========
                Log::info('🔎 DEBUG: All users in college_department_id ' . $user->college_department_id . ':');
                $allUsersInDept = User::where('college_department_id', $user->college_department_id)->get();
                foreach ($allUsersInDept as $deptUser) {
                    Log::info('   👤 User: ' . $deptUser->id . ' | ' . $deptUser->username . ' | Role: ' . $deptUser->role . 
                             ($deptUser->id == $user->id ? ' [CURRENT USER]' : ''));
                }
                // ======== END DEBUG ========
                
                // Method 1: Try exact role name 'it_personnel'
                Log::info('1️⃣ Trying exact role match: "it_personnel"');
                $itPersonnel = User::where('college_department_id', $user->college_department_id)
                    ->where('role', 'it_personnel')
                    ->where('id', '!=', $user->id) // Don't assign to self
                    ->first();
                
                if ($itPersonnel) {
                    Log::info('   ✅ FOUND with exact role match!', [
                        'id' => $itPersonnel->id,
                        'username' => $itPersonnel->username,
                        'role' => $itPersonnel->role
                    ]);
                } else {
                    Log::info('   ❌ No user with exact role "it_personnel"');
                    
                    // Method 2: Try common IT role variations
                    Log::info('2️⃣ Trying common IT roles: it, technician, it_staff, it_support, admin, administrator');
                    $itPersonnel = User::where('college_department_id', $user->college_department_id)
                        ->whereIn('role', ['it', 'technician', 'it_staff', 'it_support', 'admin', 'administrator'])
                        ->where('id', '!=', $user->id)
                        ->first();
                    
                    if ($itPersonnel) {
                        Log::info('   ✅ FOUND with common IT role!', [
                            'id' => $itPersonnel->id,
                            'username' => $itPersonnel->username,
                            'role' => $itPersonnel->role
                        ]);
                    } else {
                        Log::info('   ❌ No user with common IT roles');
                        
                        // Method 3: Try case-insensitive search
                        Log::info('3️⃣ Trying case-insensitive search for IT roles');
                        $itPersonnel = User::where('college_department_id', $user->college_department_id)
                            ->where(function($query) {
                                $query->whereRaw('LOWER(role) LIKE ?', ['%it%'])
                                      ->orWhereRaw('LOWER(role) LIKE ?', ['%tech%'])
                                      ->orWhereRaw('LOWER(role) LIKE ?', ['%support%'])
                                      ->orWhereRaw('LOWER(role) LIKE ?', ['%admin%']);
                            })
                            ->where('id', '!=', $user->id)
                            ->first();
                        
                        if ($itPersonnel) {
                            Log::info('   ✅ FOUND with case-insensitive search!', [
                                'id' => $itPersonnel->id,
                                'username' => $itPersonnel->username,
                                'role' => $itPersonnel->role
                            ]);
                        } else {
                            Log::info('   ❌ No user found with any IT-like role');
                            
                            // Method 4: Get ANY user in same department (fallback)
                            Log::info('4️⃣ Fallback: Getting any user in same department');
                            $itPersonnel = User::where('college_department_id', $user->college_department_id)
                                ->where('id', '!=', $user->id)
                                ->first();
                            
                            if ($itPersonnel) {
                                Log::info('   ⚠️ FOUND fallback user (not necessarily IT)', [
                                    'id' => $itPersonnel->id,
                                    'username' => $itPersonnel->username,
                                    'role' => $itPersonnel->role,
                                    'note' => 'This is a fallback assignment'
                                ]);
                            } else {
                                Log::warning('   ❌ FAILED: No other users in same department to assign!');
                            }
                        }
                    }
                }
                
                if ($itPersonnel) {
                    $itPersonnelId = $itPersonnel->id;
                    Log::info('🎯 ASSIGNMENT SUCCESSFUL:', [
                        'assigned_to_id' => $itPersonnelId,
                        'assigned_to_username' => $itPersonnel->username,
                        'assigned_to_role' => $itPersonnel->role
                    ]);
                } else {
                    Log::warning('🚫 NO ASSIGNMENT: Could not find any user to assign in department ' . $user->college_department_id);
                }
            } else {
                Log::warning('🚫 User college_department_id is NULL or 0', [
                    'college_department_id' => $user->college_department_id,
                    'note' => 'Cannot assign IT personnel without college_department_id'
                ]);
            }
        } else {
            Log::info('🕵️ Report is ANONYMOUS, skipping IT personnel assignment.');
        }

        // Handle file upload
        $attachmentPath = null;
        $attachmentName = null;
        $attachmentMime = null;

        if ($request->hasFile('evidence') && $request->file('evidence')->isValid()) {
            $file = $request->file('evidence');
            $attachmentPath = $file->store('reports', 'public');
            $attachmentName = $file->getClientOriginalName();
            $attachmentMime = $file->getMimeType();
            Log::info('📎 File uploaded:', [
                'name' => $attachmentName,
                'path' => $attachmentPath,
                'mime' => $attachmentMime
            ]);
        }

        // Create report data array
        $reportData = [
            'description' => $validated['description'],
            'report_category_id' => $validated['category_id'],
            'user_id' => $user->id,
            'it_personnel_id' => $itPersonnelId,
            'report_status_id' => 1, // Assuming 1 is "Pending" or "New"
            'anonymous_flag' => $isAnonymous,
            'incident_date' => $validated['incident_date'],
            'attachment_path' => $attachmentPath,
            'attachment_name' => $attachmentName,
            'attachment_mime' => $attachmentMime,
        ];

        Log::info('💾 SAVING REPORT DATA:', $reportData);

        try {
            $report = Report::create($reportData);
            
            Log::info('🎉 ========== REPORT CREATED SUCCESSFULLY ==========');
            Log::info('📊 REPORT DETAILS:', [
                'report_id' => $report->report_id,
                'it_personnel_assigned' => $report->it_personnel_id ? 'YES (ID: ' . $report->it_personnel_id . ')' : 'NO (null)',
                'anonymous' => $report->anonymous_flag ? 'YES' : 'NO',
                'incident_date' => $report->incident_date,
                'created_at' => $report->created_at
            ]);
            
            // Verify the assignment by fetching the assigned user
            if ($report->it_personnel_id) {
                $assignedUser = User::find($report->it_personnel_id);
                if ($assignedUser) {
                    Log::info('✅ VERIFIED ASSIGNMENT:', [
                        'assigned_user_id' => $assignedUser->id,
                        'assigned_user_username' => $assignedUser->username,
                        'assigned_user_role' => $assignedUser->role,
                        'assigned_user_dept_id' => $assignedUser->college_department_id
                    ]);
                }
            }
            
            Log::info('=================================================');
            
            return redirect()->route('my_reports')->with('success', 'Report submitted successfully.');
            
        } catch (\Exception $e) {
            Log::error('💥 ERROR CREATING REPORT:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'data_attempted' => $reportData
            ]);
            
            return back()->withErrors(['error' => 'Failed to submit report. Please try again.']);
        }
    }

    public function viewReport($id)
    {
        $report = Report::where('report_id', $id)
            ->orWhere('id', $id)
            ->with(['status', 'category', 'user', 'logs', 'itPersonnel'])
            ->firstOrFail();

        $attachmentUrls = [];
        if ($report->attachment_path) {
            $attachmentUrls[] = Storage::url($report->attachment_path);
        }

        return Inertia::render('user/view-report', [
            'report' => $report,
            'attachmentUrls' => $attachmentUrls,
        ]);
    }

    // Add this method to UserReportController.php
    public function destroy($id)
    {
        $user = auth()->user();
        
        // Find the report belonging to this user
        $report = Report::where('report_id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();
        
        // Delete associated file if exists
        if ($report->attachment_path) {
            Storage::disk('public')->delete($report->attachment_path);
        }
        
        // Delete the report
        $report->delete();
        
        return redirect()->route('my_reports')
            ->with('success', 'Report deleted successfully.');
    }
}