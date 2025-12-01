<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\ReportCategory; // Changed from IncidentCategory
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class UserReportController extends Controller
{
    /**
     * Show paginated reports belonging to the authenticated user.
     */
    public function MyReports(Request $request)
    {
        $user = $request->user();

        $reports = Report::where('user_id', $user->id)
            ->with(['status', 'category']) // Changed to 'category' to match the relationship name
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('user/my_reports', [
            'reports' => $reports,
        ]);
    }

    /**
     * Show the submit report page (the form).
     */
    public function submitReport(Request $request)
    {
        $categories = ReportCategory::select('id', 'name')->get(); // Changed to ReportCategory

        return Inertia::render('user/user_submit_report', [
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly submitted report.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|integer|exists:report_categories,id', // Changed to report_categories
            'description' => 'required|string',
            'is_anonymous' => 'sometimes|boolean',
            'evidence' => 'nullable|file|mimes:jpg,jpeg,png,pdf,doc,docx|max:10240',
        ]);
    
        // Handle file upload
        $attachmentPath = null;
        $attachmentName = null;
        $attachmentMime = null;
    
        if ($request->hasFile('evidence') && $request->file('evidence')->isValid()) {
            $file = $request->file('evidence');
            $attachmentPath = $file->store('reports', 'public');
            $attachmentName = $file->getClientOriginalName();
            $attachmentMime = $file->getMimeType();
        }
    
        $report = Report::create([
            'description' => $validated['description'],
            'report_category_id' => $validated['category_id'], // Changed to report_category_id
            'user_id' => $request->user()->id,
            'report_status_id' => 1, // Assuming 1 is 'pending'
            'anonymous_flag' => $validated['is_anonymous'] ?? false,
            'attachment_path' => $attachmentPath,
            'attachment_name' => $attachmentName,
            'attachment_mime' => $attachmentMime,
        ]);
    
        return redirect()->route('user/my_reports')->with('success', 'Report submitted successfully.');
    }

    /**
     * View a single report.
     */
    public function viewReport($id)
    {
        $report = Report::where('report_id', $id)
            ->with(['status', 'category', 'user', 'logs']) // Changed to 'category'
            ->firstOrFail();

        // Handle attachments - your model uses individual fields, not array
        $attachmentUrls = [];
        if ($report->attachment_path) {
            $attachmentUrls[] = Storage::url($report->attachment_path);
        }

        return Inertia::render('user/view-report', [
            'report' => $report,
            'attachmentUrls' => $attachmentUrls,
        ]);
    }
}