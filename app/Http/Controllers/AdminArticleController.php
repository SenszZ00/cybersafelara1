<?php

namespace App\Http\Controllers;

use App\Models\Article;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\ArticleCategory;

class AdminArticleController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category_id' => 'nullable|exists:article_categories,id',
            'keyword' => 'nullable|string|max:255',
            'content' => 'required|string',
        ]);

        $user = auth()->user();
        
        // For admin submissions, use status_id 2 (approved)
        // Assuming: 1 = pending, 2 = approved, 3 = rejected
        $articleStatusId = 2; // approved

        Article::create([
            'user_id' => $user?->id,
            'title' => $validated['title'],
            'category_id' => $validated['category_id'],
            'keyword' => $validated['keyword'] ?? null,
            'content' => $validated['content'],
            'article_status_id' => $articleStatusId, // Use the foreign key
        ]);

        return redirect()->route('admin_articles')
            ->with('success', 'Article published to public feed!');
    }

    public function index()
    {
        $articles = Article::with(['user:id,username', 'category:id,name', 'articleStatus:id,name'])
            ->latest()
            ->get()
            ->map(function ($article) {
                return [
                    'article_id' => $article->article_id,
                    'user_id' => $article->user_id,
                    'username' => $article->user?->username ?? 'Unknown',
                    'title' => $article->title,
                    'content' => $article->content,
                    'category' => $article->category?->name ?? 'Uncategorized', 
                    'keyword' => $article->keyword,
                    'status' => $article->articleStatus->name, // Get status name from relationship
                    'created_at' => $article->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $article->updated_at->format('Y-m-d H:i:s'),
                ];
            });

        return Inertia::render('admin/admin_articles', [
            'articles' => $articles,
        ]);
    }

    public function create()
    {
        $categories = ArticleCategory::select('id', 'name')->get();

        return Inertia::render('admin/admin_upload_article', [
            'categories' => $categories,
        ]);
    }
}