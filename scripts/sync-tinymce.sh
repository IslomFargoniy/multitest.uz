#!/usr/bin/env bash
# Copies the npm-installed TinyMCE into public/vendor/tinymce (served by the editor via tinymceScriptSrc/base_url).
# Run after every `npm install` that changes the tinymce version: npm run sync:tinymce
set -euo pipefail
cd "$(dirname "$0")/.."
rsync -a --delete node_modules/tinymce/ public/vendor/tinymce/
echo "TinyMCE $(node -p "require('./node_modules/tinymce/package.json').version") synced to public/vendor/tinymce"
