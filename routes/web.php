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
    Route::get('articles', function () {
        return Inertia::render('admin/articles');
    })->name('articles');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('reports', function () {
        return Inertia::render('admin/reports');
    })->name('reports');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('report_log', function () {
        return Inertia::render('admin/report_log');
    })->name('report_log');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('messages', function () {
        return Inertia::render('admin/messages');
    })->name('messages');
});



require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
