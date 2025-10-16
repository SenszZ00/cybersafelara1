<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\CollegeDepartment;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register', [
            'collegeDepartments' => CollegeDepartment::orderBy('name')->get(['id', 'code', 'name']),
        ]);
    }

    /**
     * Handle an incoming registration request.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'username' => 'required|string|max:255|unique:users',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'college_department_id' => 'required|exists:college_departments,id',
        ], [
            'email.unique' => 'This email is already registered. Please log in instead.',
            'username.unique' => 'This username is already taken. Try a different one.',
        ]);

        $user = User::create([
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'college_department_id' => $request->college_department_id,
        ]);

        event(new Registered($user));

        return redirect()->route('login')
            ->with('success', 'Account created successfully! Please log in to continue.');
    }
}