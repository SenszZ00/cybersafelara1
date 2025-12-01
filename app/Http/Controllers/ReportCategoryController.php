<?php

namespace App\Http\Controllers;

use App\Models\IncidentCategory;
use Illuminate\Http\Request;

class ReportCategoryController extends Controller
{
    public function index()
    {
        $categories = IncidentCategory::all();
        return response()->json($categories);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:incident_categories,name'
        ]);

        $category = IncidentCategory::create([
            'name' => $request->name
        ]);

        return response()->json($category);
    }
}