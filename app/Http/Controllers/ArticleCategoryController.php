<?php

namespace App\Http\Controllers;

use App\Models\ArticleCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ArticleCategoryController extends Controller
{
    // Fetch all categories
    public function index()
    {
        return response()->json(ArticleCategory::orderBy('name')->get());
    }

    // Add new category
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:article_categories,name',
        ]);

        $category = ArticleCategory::create($validated);
        return response()->json($category, 201);
    }

    // Update category
    public function update(Request $request, $id)
    {
        $category = ArticleCategory::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:article_categories,name,' . $id,
        ]);

        $category->update($validated);
        return response()->json($category);
    }

    // Delete category
    public function destroy($id)
    {
        $category = ArticleCategory::findOrFail($id);
        $category->delete();
        return response()->json(['message' => 'Category deleted']);
    }
}

