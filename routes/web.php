<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminArticleController;
use App\Http\Controllers\ArticleCategoryController;
use App\Http\Controllers\AdminFeedbackController;
use App\Http\Controllers\AdminReportController;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

// Route::middleware(['auth', 'verified'])->group(function () {
//     Route::get('admin_articles', function () {
//         return Inertia::render('admin/admin_articles');
//     })->name('admin_articles');
// });
Route::get('admin/admin_articles', [AdminArticleController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('admin_articles');

// Route::middleware(['auth', 'verified'])->group(function () {
//     Route::get('admin_reports', function () {
//         return Inertia::render('admin/admin_reports');
//     })->name('admin_reports');
// });
Route::get('admin_reports', [AdminReportController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('admin_reports');

// Add the assignment route
Route::post('/admin/reports/assign', [AdminReportController::class, 'assign'])
    ->middleware(['auth', 'verified'])
    ->name('admin.reports.assign');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('admin_report_log', function () {
        return Inertia::render('admin/admin_report_log');
    })->name('admin_report_log');
});

// Route::middleware(['auth', 'verified'])->group(function () {
//     Route::get('messages', function () {
//         return Inertia::render('admin/messages');
//     })->name('messages');
// });

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
    Route::get('admin_upload_article', function () {
        return Inertia::render('admin/admin_upload_article');
    })->name('admin_upload_article');
});

Route::post('/admin/articles/store', [AdminArticleController::class, 'store']);

Route::prefix('/admin/article-categories')->group(function () {
    Route::get('/', [ArticleCategoryController::class, 'index']);
    Route::post('/', [ArticleCategoryController::class, 'store']);
    Route::put('/{id}', [ArticleCategoryController::class, 'update']);
    Route::delete('/{id}', [ArticleCategoryController::class, 'destroy']);
});

// Route::get('admin/messages', [AdminFeedbackController::class, 'index'])->name('admin.feedback.index');
Route::get('admin/messages/{id}/reply', [AdminFeedbackController::class, 'reply'])->name('admin.feedback.reply');


require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
