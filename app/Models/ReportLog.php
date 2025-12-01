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
    'it_personnel_id',   
    'report_category_id', // ✅ CHANGED from incident_type
    'status',            
    'resolution_details' 
];
public function category()
{
    return $this->belongsTo(ReportCategory::class, 'report_category_id');
}

    public function report()
    {
        return $this->belongsTo(Report::class, 'report_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'it_personnel_id'); // matches table column
    }
}
