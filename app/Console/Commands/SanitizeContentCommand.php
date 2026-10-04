<?php

namespace App\Console\Commands;

use App\Models\Part;
use App\Models\Question;
use App\Models\Test;
use App\Support\HtmlSanitizer;
use Illuminate\Console\Command;

class SanitizeContentCommand extends Command
{
    protected $signature = 'content:sanitize {--dry-run : Only report how many rows would change}';

    protected $description = 'Sanitize stored rich-text (questions, parts, tests) with the HTML allow-list';

    public function handle(): int
    {
        $dry = (bool) $this->option('dry-run');
        $changed = 0;

        foreach ([[Question::class, 'textarea'], [Part::class, 'description'], [Test::class, 'description']] as [$model, $field]) {
            $model::withTrashed()->whereNotNull($field)->chunkById(200, function ($rows) use ($field, $dry, &$changed, $model) {
                foreach ($rows as $row) {
                    $clean = HtmlSanitizer::clean($row->{$field});
                    if ($clean === $row->{$field}) {
                        continue;
                    }

                    $changed++;
                    if (! $dry) {
                        // Bypass observers/events: only the sanitized text changes.
                        $model::withTrashed()->whereKey($row->getKey())->toBase()->update([$field => $clean]);
                    }
                }
            });
        }

        $this->info(($dry ? 'Would update ' : 'Updated ')."{$changed} rows.");

        return self::SUCCESS;
    }
}
