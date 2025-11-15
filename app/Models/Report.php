<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    use HasFactory;

    protected $primaryKey = 'report_id';
    
    protected $fillable = [
        'user_id',
        'it_personnel_id',
        'anonymous_flag',
        'incident_type',
        'description',
        'attachment_mime',
        'attachment_name',
        'attachment_path',
        'report_status_id',
    ];

    protected static function boot()
    {
        parent::boot();

        // When a report is created (submitted)
        static::created(function ($report) {
            // 🔹 AUTOMATIC ASSIGNMENT LOGIC
            // Only assign if report is not anonymous and user has a college department
            if (!$report->anonymous_flag && $report->user && $report->user->college_department_id) {
                $itPersonnel = User::where('role', 'it')
                    ->where('college_department_id', $report->user->college_department_id)
                    ->first();
                
                if ($itPersonnel) {
                    $report->update([
                        'it_personnel_id' => $itPersonnel->id,
                        'report_status_id' => 2, // under review
                    ]);
                }
            }

            // Create initial log (now includes auto-assigned personnel if any)
            ReportLog::create([
                'report_id' => $report->report_id,
                'incident_type' => $report->incident_type,
                'status' => $report->it_personnel_id ? 'under review' : 'pending', // Status depends on assignment
                'it_personnel_id' => $report->it_personnel_id, // Now includes auto-assigned personnel
                'resolution_details' => null,
                'created_at' => $report->created_at,
                'updated_at' => $report->updated_at,
            ]);
        });

        // When a report is updated (keep your existing code)
        static::updated(function ($report) {
            $changes = $report->getChanges();
            
            // Map report_status_id to status enum
            $statusMap = [
                1 => 'pending',
                2 => 'under review', 
                3 => 'resolved'
            ];

            // Log status changes
            if (array_key_exists('report_status_id', $changes)) {
                $newStatusId = $changes['report_status_id'];
                $newStatus = $statusMap[$newStatusId] ?? 'pending';
                
                ReportLog::create([
                    'report_id' => $report->report_id,
                    'incident_type' => $report->incident_type,
                    'status' => $newStatus,
                    'it_personnel_id' => $report->it_personnel_id,
                    'resolution_details' => $newStatus === 'resolved' ? 'Issue has been resolved' : null,
                    'created_at' => $report->updated_at,
                    'updated_at' => $report->updated_at,
                ]);
            }

            // Log IT personnel assignment (even without status change)
            if (array_key_exists('it_personnel_id', $changes) && $report->it_personnel_id) {
                $currentStatus = $statusMap[$report->report_status_id] ?? 'pending';
                
                ReportLog::create([
                    'report_id' => $report->report_id,
                    'incident_type' => $report->incident_type,
                    'status' => $currentStatus,
                    'it_personnel_id' => $report->it_personnel_id,
                    'resolution_details' => $currentStatus === 'resolved' ? 'Issue has been resolved' : null,
                    'created_at' => $report->updated_at,
                    'updated_at' => $report->updated_at,
                ]);
            }
        });
    }

    // 🔹 Relationship with ReportStatus
    public function status()
    {
        return $this->belongsTo(ReportStatus::class, 'report_status_id');
    }

    // 🔹 Relationship with User (reporter)
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // 🔹 Relationship with IT Personnel
    public function itPersonnel()
    {
        return $this->belongsTo(User::class, 'it_personnel_id');
    }

    public function logs()
    {
        return $this->hasMany(ReportLog::class, 'report_id');
    }
}