<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Feedback;
use Inertia\Inertia;

class FeedbackController extends Controller
{
    // Remove the constructor and let the route handle middleware
    // public function __construct()
    // {
    //     $this->middleware(['auth', 'verified']);
    // }

    public function store(Request $request)
    {
        // Validate input
        $request->validate([
            'subject' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        // Save feedback with the logged-in user's ID
        Feedback::create([
            'user_id' => auth()->id(),
            'subject' => $request->subject,
            'content' => $request->content,
        ]);

        // For Inertia, return a redirect with flash message
        return redirect()->back()->with([
            'success' => 'Feedback submitted successfully!'
        ]);
    }
}