<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    use HasFactory;

    protected $primaryKey = 'article_id';

    protected $fillable = [
        'user_id',
        'category_id',
        'article_status_id', 
        'title',
        'content',
        'keyword',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function category()
    {
        return $this->belongsTo(ArticleCategory::class, 'category_id');
    }

    public function articleStatus()
    {
        return $this->belongsTo(ArticleStatus::class, 'article_status_id');
    }
}