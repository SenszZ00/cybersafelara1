<?php

namespace App\Http\Controllers;

use App\Models\Article;
use Illuminate\Http\Request; // ✅ FIXED — correct Request class
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ArticleController extends Controller
{
    public function index() {}

    public function create() {}

    public function store(Request $request) {}

    public function show(Article $article) {}

    public function edit(Article $article) {}

    public function update(Request $request, Article $article) {}

    // Add to ArticleController.php
    public function destroy($id)
    {
        $user = auth()->user();
        
        // Find the article belonging to this user
        $article = Article::where('article_id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();
        
        // Delete the article
        $article->delete();
        
        return redirect()->route('my_articles')
            ->with('success', 'Article deleted successfully.');
    }


    /**
     * Display all articles created by the logged in user
     */
    public function myArticles(Request $request)
    {
        $userId = auth()->id();
        
        $query = DB::table('articles')
            ->leftJoin('article_categories', 'articles.category_id', '=', 'article_categories.id')
            ->leftJoin('article_statuses', 'articles.article_status_id', '=', 'article_statuses.id')
            ->where('articles.user_id', $userId);

        // Apply filters
        if ($request->has('date') && $request->date) {
            $query->whereDate('articles.created_at', $request->date);
        }

        if ($request->has('status') && $request->status) {
            $query->where('article_statuses.name', $request->status);
        }

        if ($request->has('category') && $request->category) {
            $query->where('article_categories.name', $request->category);
        }

        $articles = $query->select(
                'articles.article_id',
                'articles.title',
                'article_categories.name as category',
                'articles.created_at',
                'articles.updated_at',
                'article_statuses.name as status',
                'articles.content'
            )
            ->orderBy('articles.created_at', 'desc')
            ->paginate(20)
            ->withQueryString();

        // Get all statuses and categories for filter dropdowns
        $statuses = \App\Models\ArticleStatus::select('id', 'name')->get();
        $categories = \App\Models\ArticleCategory::select('id', 'name')->get();
        
        return Inertia::render('user/my_articles', [
            'articles' => $articles,
            'statuses' => $statuses,
            'categories' => $categories,
        ]);
    }


    /**
     * Store article submitted by a normal user
     */
    public function storeUserArticle(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category_id' => 'required|exists:article_categories,id',
            'content' => 'required|string',
            'keyword' => 'nullable|string',
        ]);

        Article::create([
            'user_id' => auth()->id(), // ✅ FIXED
            'category_id' => $validated['category_id'],
            'article_status_id' => 1, // pending
            'title' => $validated['title'],
            'content' => $validated['content'],
            'keyword' => $validated['keyword'],
        ]);

        return redirect()->route('my_articles')
            ->with('success', 'Your article has been submitted and is awaiting approval.');
    }
}