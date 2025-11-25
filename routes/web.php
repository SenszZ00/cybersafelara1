<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminArticleController;
use App\Http\Controllers\ArticleCategoryController;
use App\Http\Controllers\AdminFeedbackController;
use App\Http\Controllers\AdminReportController;
use App\Http\Controllers\AdminReportLogController;
use App\Http\Controllers\PublicArticleController;
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

// Route::get('/public/articles', [PublicArticleController::class, 'index']);

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
        return Inertia::render('admin/admin_public_articles');
    })->name('admin_public_articles');
});

// Assignment route
Route::post('/admin/reports/assign', [AdminReportController::class, 'assign'])
    ->middleware(['auth', 'verified'])
    ->name('admin.reports.assign');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('admin_report_log', function () {
        return Inertia::render('admin/admin_report_log');
    })->name('admin_report_log');
});

Route::get('admin/messages', [AdminFeedbackController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('messages');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('it_report_log', function () {
        return Inertia::render('it/it-report_log');
    })->name('it_report_log');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('it_reports', function () {
        return Inertia::render('it/it-reports');
    })->name('it_reports');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('articles', function () {
        return Inertia::render('user/articles');
    })->name('articles');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('my_articles', function () {
        return Inertia::render('user/my_articles');
    })->name('my_articles');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('my_reports', function () {
        return Inertia::render('user/my_reports');
    })->name('my_reports');
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

// Report Log Routes
Route::get('/admin/report-log', [AdminReportLogController::class, 'index'])
    ->name('admin.report-log.index');

Route::get('/admin/reports/{report}/log', [AdminReportLogController::class, 'show'])
    ->name('admin.reports.log');

// Feedback Routes
Route::get('admin/messages/{id}/reply', [AdminFeedbackController::class, 'reply'])
    ->middleware(['auth', 'verified'])
    ->name('admin.feedback.reply');

// Duplicate (kept for safety)
Route::get('/admin/reports/{report}/log', [AdminReportLogController::class, 'show'])
    ->name('admin.reports.log');

Route::get('/admin/reports-logs', [AdminReportLogController::class, 'index'])
    ->name('admin.reports-logs.index');

Route::post('/admin/reports/{report}/manual-log', [AdminReportLogController::class, 'manualLog'])
    ->name('admin.reports.manual-log');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
