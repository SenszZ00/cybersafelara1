<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReportLog extends Model
{
    use HasFactory;

    protected $primaryKey = 'log_id';
    
    protected $fillable = [
        'report_id',
        'incident_type',
        'resolution_details',
        'status',
        'it_personnel_id',
    ];

    protected $casts = [
        'status' => 'string',
    ];

    // Relationship with Report
    public function report()
    {
        return $this->belongsTo(Report::class, 'report_id');
    }

    // Relationship with IT Personnel
    public function itPersonnel()
    {
        return $this->belongsTo(User::class, 'it_personnel_id');
    }
}