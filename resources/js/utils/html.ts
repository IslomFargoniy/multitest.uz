/**
 * Plain text from rich-text HTML (TinyMCE content) for one-line previews.
 * DOMParser decodes entities such as &nbsp; &amp; &#39; and never executes scripts.
 */
export function htmlToPlainText(html?: string | null): string {
    if (!html) return '';

    const text =
        typeof DOMParser !== 'undefined'
            ? (new DOMParser().parseFromString(html.replace(/<(br|\/p|\/div|\/li|\/h[1-6])[^>]*>/gi, ' $&'), 'text/html').body.textContent ?? '')
            : html.replace(/<[^>]*>/g, ' ');

    return text.replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
}
