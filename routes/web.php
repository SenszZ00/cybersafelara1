<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminArticleController;
use App\Http\Controllers\ArticleCategoryController;
use App\Http\Controllers\AdminFeedbackController;
use App\Http\Controllers\AdminReportController;
use App\Http\Controllers\AdminReportLogController;
use App\Http\Controllers\PublicArticleController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\ArticleController;
use App\Http\Controllers\UserReportController;
use App\Http\Controllers\ReportCategoryController;
use App\Http\Controllers\FeedbackController;
use App\Http\Controllers\ReportLogController;
use App\Http\Controllers\ReportStatusController;
use App\Http\Controllers\ReportController;
use App\Models\Article;
use Inertia\Inertia;

Route::get('/', function () {
    // Only fetch approved articles (status_id = 2)
    $articles = \App\Models\Article::with(['user:id,user_id,name,username', 'category:id,name'])
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
                    'username' => $article->user->username,
                ] : null,
                'category' => $article->category ? [
                    'name' => $article->category->name,
                ] : null,
            ];
        });

    return Inertia::render('welcome', [
        'articles' => $articles,
    ]);
})->name('home');


Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

// Admin Articles Routes
Route::get('admin/admin_articles', [AdminArticleController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('admin_articles');

Route::get('admin_reports', [AdminReportController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('admin_reports');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('admin_public_articles', function () {
        // Only fetch approved articles (status_id = 2) - same as welcome page
        $articles = \App\Models\Article::with(['user:id,user_id,name,username', 'category:id,name'])
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
                        'username' => $article->user->username,
                    ] : null,
                    'category' => $article->category ? [
                        'name' => $article->category->name,
                    ] : null,
                ];
            });

        return Inertia::render('admin/admin_public_articles', [
            'articles' => $articles,
        ]);
    })->name('admin_public_articles');
});

// Assignment route
Route::post('/admin/reports/assign', [AdminReportController::class, 'assign'])
    ->middleware(['auth', 'verified'])
    ->name('admin.reports.assign');

Route::get('admin_report_log', [AdminReportLogController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('admin_report_log');


Route::get('admin/messages', [AdminFeedbackController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('messages');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('articles', function () {
        return Inertia::render('user/articles');
    })->name('articles');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('user/my_articles', [ArticleController::class, 'myArticles'])
        ->name('my_articles');
});

// Route::middleware(['auth', 'verified'])->group(function () {
//     Route::post('/articles/store', [ArticleController::class, 'storeUserArticle'])
//         ->name('articles.store');
// });


Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/upload_article', function () {
        return Inertia::render('user/user_upload_article');
    })->name('upload_article');
});


Route::post('/articles/store', [ArticleController::class, 'storeUserArticle'])
    ->middleware(['auth', 'verified'])
    ->name('articles.store');

Route::delete('/articles/{id}', [ArticleController::class, 'destroy'])
    ->middleware(['auth', 'verified'])
    ->name('articles.destroy');

Route::middleware(['auth','verified'])->group(function () {
    Route::get('/my_reports', [UserReportController::class, 'MyReports'])->name('my_reports');

    // GET page that shows the submit form
    Route::get('/user/user_submit_report', [UserReportController::class, 'submitReport'])
        ->name('user.user_submit_report');

    // POST endpoint the form will call
    Route::post('/user/reports/store', [UserReportController::class, 'store'])
        ->name('user.reports.store');

    // delete a report
    Route::delete('/user/reports/{id}', [UserReportController::class, 'destroy'])
        ->name('user.reports.destroy');

    // view a single report
    Route::get('/user/view-report/{id}', [UserReportController::class, 'viewReport'])
        ->name('user.view_report');

        Route::get('/user/incident_categories', [ReportCategoryController::class, 'index'])
    ->name('user.incident_categories.index');

    Route::post('/user/incident-categories', [ReportCategoryController::class, 'store'])
    ->name('user.incident_categories.store');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('admin_upload_article', [AdminArticleController::class, 'create'])
        ->name('admin_upload_article');
});

// Admin Article Management Routes
Route::middleware(['auth', 'verified'])->prefix('admin')->group(function () {
    Route::post('/articles/store', [AdminArticleController::class, 'store'])
        ->name('admin.articles.store');

    Route::patch('/articles/{article}/approve', [AdminArticleController::class, 'approve'])
        ->name('admin.articles.approve');

    Route::patch('/articles/{article}/reject', [AdminArticleController::class, 'reject'])
        ->name('admin.articles.reject');

    Route::get('/articles/status/{status}', [AdminArticleController::class, 'getByStatus'])
        ->name('admin.articles.byStatus');
});

// Article Categories Routes
Route::prefix('/admin/article-categories')->group(function () {
    Route::get('/', [ArticleCategoryController::class, 'index']);
    Route::post('/', [ArticleCategoryController::class, 'store']);
    Route::put('/{id}', [ArticleCategoryController::class, 'update']);
    Route::delete('/{id}', [ArticleCategoryController::class, 'destroy']);
});


//User Articles
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('articles', [SearchController::class, 'search'])->name('articles');
});

Route::get('/search', [SearchController::class, 'search'])->name('search');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('/feedback', [FeedbackController::class, 'store'])
        ->name('feedback.store');
});

Route::middleware(['auth', 'verified'])->group(function () {
    // IT Assigned Reports
    Route::get('it_reports', [ReportController::class, 'assignedReports'])
        ->name('it_reports');

    // IT Report Log page
    Route::get('it_report_log', [ReportLogController::class, 'index'])
        ->name('it_report_log');

    // Status updates
    Route::put('/reports/{report}/status', [ReportStatusController::class, 'update'])
        ->name('reports.updateStatus');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
