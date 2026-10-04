<?php

namespace App\Support;

use HTMLPurifier;
use HTMLPurifier_Config;

/**
 * Allow-list HTML sanitizer for rich text produced by the TinyMCE editor.
 */
class HtmlSanitizer
{
    private static ?HTMLPurifier $purifier = null;

    public static function clean(?string $html): string
    {
        if ($html === null || trim($html) === '') {
            return '';
        }

        return self::purifier()->purify($html);
    }

    private static function purifier(): HTMLPurifier
    {
        if (self::$purifier) {
            return self::$purifier;
        }

        $cacheDir = storage_path('framework/cache/htmlpurifier');
        if (! is_dir($cacheDir)) {
            @mkdir($cacheDir, 0775, true);
        }

        $config = HTMLPurifier_Config::createDefault();
        $config->set('Core.Encoding', 'UTF-8');
        $config->set('HTML.Doctype', 'HTML 4.01 Transitional');
        $config->set('HTML.Allowed', implode(',', [
            'p[style]', 'br', 'b', 'strong', 'i', 'em', 'u', 's', 'strike', 'sub', 'sup',
            'ul[style]', 'ol[style]', 'li[style]', 'h1[style]', 'h2[style]', 'h3[style]', 'h4[style]',
            'blockquote', 'hr', 'pre', 'code', 'span[style]', 'div[style]',
            'table[border|cellpadding|cellspacing|style|width]', 'thead', 'tbody', 'tfoot', 'tr',
            'th[colspan|rowspan|style|width]', 'td[colspan|rowspan|style|width]',
            'img[src|alt|width|height|style]', 'a[href|target|rel]',
        ]));
        $config->set('CSS.AllowedProperties', [
            'color', 'background-color', 'font-weight', 'font-style', 'text-decoration', 'text-align',
            'font-size', 'width', 'height', 'max-width', 'border', 'border-collapse', 'padding', 'margin',
        ]);
        $config->set('URI.AllowedSchemes', ['http' => true, 'https' => true, 'mailto' => true]);
        $config->set('Attr.AllowedFrameTargets', ['_blank']);
        $config->set('HTML.TargetNoopener', true);
        $config->set('AutoFormat.RemoveEmpty', false);

        if (is_dir($cacheDir) && is_writable($cacheDir)) {
            $config->set('Cache.SerializerPath', $cacheDir);
        } else {
            $config->set('Cache.DefinitionImpl', null);
        }

        return self::$purifier = new HTMLPurifier($config);
    }
}
