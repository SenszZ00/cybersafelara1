<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('admin_articles', function () {
        return Inertia::render('admin/admin_articles');
    })->name('admin_articles');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('admin_reports', function () {
        return Inertia::render('admin/admin_reports');
    })->name('admin_reports');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('admin_report_log', function () {
        return Inertia::render('admin/admin_report_log');
    })->name('admin_report_log');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('messages', function () {
        return Inertia::render('admin/messages');
    })->name('messages');
});

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


require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
