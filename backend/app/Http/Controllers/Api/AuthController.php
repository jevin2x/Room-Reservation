<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\ApiController;
use App\Models\Section;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AuthController extends ApiController
{
    /**
     * Register a new section account. Each section can only have one account.
     */
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'program' => ['required', Rule::in(array_keys(Section::PROGRAMS))],
            'year' => ['required', Rule::in(Section::YEARS)],
            'section' => ['required', Rule::in(Section::SECTIONS)],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ]);

        $section = Section::firstOrCreate([
            'program' => $data['program'],
            'year' => $data['year'],
            'section' => $data['section'],
        ]);

        if (User::where('section_id', $section->id)->exists()) {
            return $this->error(
                "{$section->label} already has an account.",
                422
            );
        }

        $user = User::create([
            'section_id' => $section->id,
            'password' => $data['password'],
        ]);

        return $this->success($this->tokenPayload($user), 201);
    }

    /**
     * Log a section account in.
     */
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'program' => ['required', Rule::in(array_keys(Section::PROGRAMS))],
            'year' => ['required', Rule::in(Section::YEARS)],
            'section' => ['required', Rule::in(Section::SECTIONS)],
            'password' => ['required', 'string'],
        ]);

        $section = Section::where('program', $data['program'])
            ->where('year', $data['year'])
            ->where('section', $data['section'])
            ->first();

        $user = $section ? User::where('section_id', $section->id)->first() : null;

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            return $this->error('Invalid credentials for this section.', 422);
        }

        return $this->success($this->tokenPayload($user));
    }

    /**
     * Log the authenticated user out by revoking the current token.
     */
    public function logout(Request $request): Response
    {
        $request->user()->currentAccessToken()->delete();

        return response()->noContent();
    }

    /**
     * Return the authenticated user.
     */
    public function me(Request $request): JsonResponse
    {
        return $this->success($this->userPayload($request->user()->load('section')));
    }

    /**
     * Build the auth payload: a fresh API token plus the section user info.
     */
    private function tokenPayload(User $user): array
    {
        $user->load('section');

        return [
            'token' => $user->createToken('auth')->plainTextToken,
            'user' => $this->userPayload($user),
        ];
    }

    /**
     * Build the public user payload for the section account.
     */
    private function userPayload(User $user): array
    {
        return [
            'id' => $user->id,
            'program' => $user->section->program,
            'year' => $user->section->year,
            'section' => $user->section->section,
            'section_label' => $user->section->label,
        ];
    }
}