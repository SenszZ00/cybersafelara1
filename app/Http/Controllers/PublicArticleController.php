<?php

namespace App\Http\Controllers;

use App\Models\Article;
use Inertia\Inertia;

class PublicArticleController extends Controller
{
    public function index()
    {
        // Only fetch approved articles (status_id = 2)
        $articles = Article::with(['user:id,user_id,name,username', 'category:id,name'])
            ->where('article_status_id', 2) // Only approved articles
            ->latest()
            ->get()
            ->map(function ($article) {
                return [
                    'article_id' => $article->article_id,
                    'title' => $article->title,
                    'content' => $article->content,
                    'keyword' => $article->keyword,
                    'created_at' => $article->created_at->format('Y-m-d H:i:s'),
                    'user' => $article->user ? [
                        'name' => $article->user->name,
                        'username' => $article->user->username,
                    ] : null,
                    'category' => $article->category ? [
                        'name' => $article->category->name,
                    ] : null,
                ];
            });

        return Inertia::render('Welcome', [
            'articles' => $articles,
        ]);
    }
}