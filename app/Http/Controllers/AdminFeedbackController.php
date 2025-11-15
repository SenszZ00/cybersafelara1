<?php

namespace App\Http\Controllers;

use App\Models\Feedback;
use Inertia\Inertia;

class AdminFeedbackController extends Controller
{
    public function index()
    {
        $feedbacks = Feedback::with(['user:id,username,name,email'])
            ->latest('created_at')
            ->get()
            ->map(function ($fb) {
                return [
                    'feedback_id' => $fb->feedback_id,
                    'user_id' => $fb->user_id,
                    'user' => $fb->user ? [
                        'id' => $fb->user->id,
                        'username' => $fb->user->username ?? null,
                        'name' => $fb->user->name ?? null,
                        'email' => $fb->user->email ?? null,
                    ] : null,
                    'subject' => $fb->subject,
                    'content' => $fb->content,
                    'created_at' => $fb->created_at ? $fb->created_at->format('Y-m-d H:i:s') : null,
                ];
            });

        return Inertia::render('admin/messages', [
            'feedbacks' => $feedbacks,
        ]);
    }

    // (Optional) add reply method later
}