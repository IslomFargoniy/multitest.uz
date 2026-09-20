<?php

namespace App\Http\Controllers;

use App\Models\Test;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function index(): Response
    {
        $baseUrl = config('app.url', 'https://multitest.uz');

        $staticRoutes = [
            [
                'url' => $baseUrl . '/',
                'lastmod' => now()->toAtomString(),
                'changefreq' => 'daily',
                'priority' => '1.0',
            ],
            [
                'url' => $baseUrl . '/test',
                'lastmod' => now()->toAtomString(),
                'changefreq' => 'daily',
                'priority' => '0.9',
            ],
            [
                'url' => $baseUrl . '/login',
                'lastmod' => now()->startOfWeek()->toAtomString(),
                'changefreq' => 'monthly',
                'priority' => '0.6',
            ],
            [
                'url' => $baseUrl . '/register',
                'lastmod' => now()->startOfWeek()->toAtomString(),
                'changefreq' => 'monthly',
                'priority' => '0.6',
            ],
        ];

        // Public Tests
        $tests = Test::where('is_public', true)
            ->latest('updated_at')
            ->get();

        $testRoutes = $tests->map(function ($test) use ($baseUrl) {
            return [
                'url' => $baseUrl . '/test/' . $test->id,
                'lastmod' => $test->updated_at?->toAtomString() ?? now()->toAtomString(),
                'changefreq' => 'weekly',
                'priority' => '0.8',
            ];
        })->toArray();

        $allRoutes = array_merge($staticRoutes, $testRoutes);

        $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
        $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">' . "\n";

        foreach ($allRoutes as $route) {
            $xml .= "  <url>\n";
            $xml .= "    <loc>" . htmlspecialchars($route['url']) . "</loc>\n";
            $xml .= "    <lastmod>" . $route['lastmod'] . "</lastmod>\n";
            $xml .= "    <changefreq>" . $route['changefreq'] . "</changefreq>\n";
            $xml .= "    <priority>" . $route['priority'] . "</priority>\n";
            $xml .= "  </url>\n";
        }

        $xml .= '</urlset>';

        return response($xml, 200, [
            'Content-Type' => 'application/xml',
        ]);
    }
}
