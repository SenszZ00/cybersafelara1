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

    public function destroy(Article $article) {}


    /**
     * Display all articles created by the logged in user
     */
    public function myArticles()
    {
        $userId = auth()->id(); // ✅ safer than auth()->user()->user_id

        $articles = DB::table('articles')
            ->leftJoin('article_categories', 'articles.category_id', '=', 'article_categories.id')
            ->leftJoin('article_statuses', 'articles.article_status_id', '=', 'article_statuses.id')
            ->where('articles.user_id', $userId)
            ->select(
                'articles.article_id',
                'articles.title',
                'article_categories.name as category',
                'articles.created_at',
                'articles.updated_at',
                'article_statuses.name as status',
                'articles.content'
            )
            ->orderBy('articles.created_at', 'desc')
            ->get();

        return Inertia::render('user/my_articles', [
            'articles' => $articles
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