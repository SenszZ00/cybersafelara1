<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Report extends Model
{
    use HasFactory;

    protected $table = 'reports';

    protected $primaryKey = 'report_id';

    protected $fillable = [
        'user_id',
        'it_personnel_id',
        'report_category_id', // Updated from incident_category_id
        'anonymous_flag',
        'description',
        'attachment_mime',
        'attachment_name',
        'attachment_path',
        'report_status_id',
    ];

    /**
     * Get the report category for this report.
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(ReportCategory::class, 'report_category_id');
    }

    /**
     * Get the user who submitted the report.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the assigned IT personnel.
     */
    public function itPersonnel(): BelongsTo
    {
        return $this->belongsTo(User::class, 'it_personnel_id');
    }

    /**
     * Get the report logs.
     */
    public function logs(): HasMany
    {
        return $this->hasMany(ReportLog::class, 'report_id');
    }

    /**
     * Get the report status.
     */
    public function status(): BelongsTo
    {
        return $this->belongsTo(ReportStatus::class, 'report_status_id');
    }
}