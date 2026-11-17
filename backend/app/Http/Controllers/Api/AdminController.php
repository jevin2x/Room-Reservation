<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\ApiController;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends ApiController
{
    /**
     * List every registered section account.
     */
    public function index(): JsonResponse
    {
        $users = User::query()
            ->with('section')
            ->get()
            ->map(fn (User $user) => $this->payload($user))
            ->values();

        return $this->success($users);
    }

    /**
     * Change the password of a registered section account.
     */
    public function updatePassword(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ]);

        $user->update([
            'password' => $data['password'],
        ]);

        // Force the section to sign in again with the new password.
        $user->tokens()->delete();

        return $this->success($this->payload($user));
    }

    /**
     * Build the public payload for a registered section account.
     */
    private function payload(User $user): array
    {
        return [
            'id' => $user->id,
            'program' => $user->section->program,
            'year' => $user->section->year,
            'section' => $user->section->section,
            'section_label' => $user->section->label,
            'created_at' => $user->created_at?->toISOString(),
        ];
    }
}