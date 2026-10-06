<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\PlayStoreTesterInviteMail;
use App\Models\User\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PlayStoreTesterController extends Controller
{
    /**
     * Display Google Play Testers management dashboard.
     */
    public function index(Request $request)
    {
        abort_unless($request->user()?->hasRole('Admin'), 403, 'Faqat adminlar uchun ruxsat etilgan.');

        $query = User::query()
            ->whereNotNull('email')
            ->where('email', '!=', '');

        // Statistics
        $totalWithEmail = (clone $query)->count();
        $totalGmail = (clone $query)->where('email', 'like', '%@gmail.com')->count();
        $totalInvited = (clone $query)->whereNotNull('tester_invited_at')->count();
        $totalUninvitedGmail = (clone $query)
            ->where('email', 'like', '%@gmail.com')
            ->whereNull('tester_invited_at')
            ->count();

        // Filters
        $filter = $request->input('filter', 'gmail');
        $search = $request->input('search', '');

        $listQuery = clone $query;

        if ($filter === 'gmail') {
            $listQuery->where('email', 'like', '%@gmail.com');
        } elseif ($filter === 'invited') {
            $listQuery->whereNotNull('tester_invited_at');
        } elseif ($filter === 'uninvited') {
            $listQuery->where('email', 'like', '%@gmail.com')->whereNull('tester_invited_at');
        }

        if (!empty($search)) {
            $listQuery->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $users = $listQuery
            ->orderByRaw('tester_invited_at IS NOT NULL, id DESC')
            ->paginate($request->input('per_page', 15))
            ->withQueryString();

        // All Gmail addresses for 1-click clipboard copy
        $allGmailAddresses = User::whereNotNull('email')
            ->where('email', 'like', '%@gmail.com')
            ->pluck('email')
            ->unique()
            ->values();

        return Inertia::render('play-store-tester/index', [
            'users' => $users,
            'stats' => [
                'total_with_email' => $totalWithEmail,
                'total_gmail' => $totalGmail,
                'total_invited' => $totalInvited,
                'total_uninvited_gmail' => $totalUninvitedGmail,
            ],
            'filters' => [
                'filter' => $filter,
                'search' => $search,
            ],
            'allGmailAddresses' => $allGmailAddresses,
            'defaultTestingUrl' => 'https://play.google.com/apps/testing/uz.multitest.app',
        ]);
    }

    /**
     * Export Gmail addresses as CSV formatted specifically for Google Play Console.
     */
    public function exportCsv(Request $request): StreamedResponse
    {
        abort_unless($request->user()?->hasRole('Admin'), 403);

        $scope = $request->input('scope', 'gmail');

        $query = User::query()
            ->whereNotNull('email')
            ->where('email', '!=', '');

        if ($scope === 'gmail') {
            $query->where('email', 'like', '%@gmail.com');
        }

        $emails = $query->pluck('email')->unique()->filter()->values();
        $filename = 'multitest_google_play_testers_' . date('Y-m-d') . '.csv';

        return response()->streamDownload(function () use ($emails) {
            $handle = fopen('php://output', 'w');
            
            // Standard CSV header for email lists
            fputcsv($handle, ['email']);
            
            foreach ($emails as $email) {
                fputcsv($handle, [trim($email)]);
            }
            
            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    /**
     * Send email invitations to testers.
     */
    public function sendEmail(Request $request)
    {
        abort_unless($request->user()?->hasRole('Admin'), 403);

        $validated = $request->validate([
            'target' => 'required|in:all_gmail,uninvited_gmail,selected,test_single',
            'selected_ids' => 'required_if:target,selected|array',
            'selected_ids.*' => 'integer|exists:users,id',
            'test_email' => 'required_if:target,test_single|nullable|email',
            'limit' => 'nullable|integer|min:1|max:500',
            'subject' => 'nullable|string|max:200',
            'message' => 'nullable|string|max:2000',
            'testing_url' => 'nullable|url',
        ]);

        $testingUrl = $validated['testing_url'] ?: 'https://play.google.com/apps/testing/uz.multitest.app';
        $subject = $validated['subject'] ?: null;
        $message = $validated['message'] ?: null;

        // 1. Single test email to admin
        if ($validated['target'] === 'test_single') {
            $adminUser = $request->user();
            $recipientUser = new User([
                'name' => $adminUser->name ?? 'Admin',
                'email' => $validated['test_email'],
            ]);

            try {
                Mail::to($validated['test_email'])->send(
                    new PlayStoreTesterInviteMail($recipientUser, $testingUrl, $subject, $message)
                );

                return back()->with('success', "Test xati muvaffaqiyatli {$validated['test_email']} manziliga yuborildi!");
            } catch (\Throwable $e) {
                Log::error('PlayStoreTester test email error: ' . $e->getMessage());
                return back()->withErrors(['email' => "Xat yuborishda xatolik: " . $e->getMessage()]);
            }
        }

        // 2. Fetch target users
        $query = User::query()->whereNotNull('email')->where('email', '!=', '');

        if ($validated['target'] === 'selected') {
            $query->whereIn('id', $validated['selected_ids']);
        } elseif ($validated['target'] === 'uninvited_gmail') {
            $query->where('email', 'like', '%@gmail.com')->whereNull('tester_invited_at');
        } elseif ($validated['target'] === 'all_gmail') {
            $query->where('email', 'like', '%@gmail.com');
        }

        if (!empty($validated['limit'])) {
            $query->limit($validated['limit']);
        }

        $recipients = $query->get();

        if ($recipients->isEmpty()) {
            return back()->withErrors(['error' => "Yuborish uchun hech qanday foydalanuvchi topilmadi."]);
        }

        // Increase execution time for batch sending
        @set_time_limit(300);

        $sentCount = 0;
        $failedCount = 0;

        foreach ($recipients as $recipient) {
            try {
                Mail::to($recipient->email)->send(
                    new PlayStoreTesterInviteMail($recipient, $testingUrl, $subject, $message)
                );

                $recipient->update([
                    'tester_invited_at' => now(),
                    'tester_invite_count' => ($recipient->tester_invite_count ?? 0) + 1,
                ]);

                $sentCount++;
                
                // Small sleep to be polite to Gmail SMTP
                usleep(50000); // 50ms
            } catch (\Throwable $e) {
                $failedCount++;
                Log::error("Failed to send tester invite to {$recipient->email}: " . $e->getMessage());
            }
        }

        $resultMsg = "{$sentCount} ta foydalanuvchiga taklifnoma xati yuborildi!";
        if ($failedCount > 0) {
            $resultMsg .= " ({$failedCount} ta xatda xatolik yuz berdi).";
        }

        return back()->with('success', $resultMsg);
    }
}
