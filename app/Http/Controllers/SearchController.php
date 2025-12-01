<?php


namespace App\Http\Controllers;


use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Article;
use App\Models\ArticleCategory;


class SearchController extends Controller
{
    public function search(Request $request)
    {
        $request->validate([
            'search' => 'nullable|string|max:255',
        ]);


        $q = trim($request->input('search', ''));


        // Find articles where title/content/keyword match OR category matches
        $articles = Article::with(['category', 'user'])
            ->where('article_status_id', 2) // Only approved articles
            ->when($q !== '', function ($query) use ($q) {
                $like = '%' . $q . '%';


                $query->where(function ($qbuilder) use ($like) {
                    $qbuilder->where('title', 'like', $like)
                             ->orWhere('content', 'like', $like)
                             ->orWhere('keyword', 'like', $like);
                })
                ->orWhereHas('category', function ($catQuery) use ($like) {
                    $catQuery->where('name', 'like', $like);
                });
            })
            ->orderBy('created_at', 'desc')
            ->get();


        // Category results
        $categories = ArticleCategory::when($q !== '', function ($query) use ($q) {
            $query->where('name', 'like', '%' . $q . '%');
        })->get();


        return Inertia::render('user/articles', [
            'articles' => $articles,
            'categories' => $categories,
            'search' => $q,
        ]);
    }
}



