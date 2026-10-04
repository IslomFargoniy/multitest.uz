import DOMPurify from 'dompurify';
import { HTMLAttributes, useMemo } from 'react';

const ALLOWED_TAGS = [
    'p',
    'br',
    'b',
    'strong',
    'i',
    'em',
    'u',
    's',
    'strike',
    'sub',
    'sup',
    'ul',
    'ol',
    'li',
    'h1',
    'h2',
    'h3',
    'h4',
    'blockquote',
    'hr',
    'pre',
    'code',
    'span',
    'div',
    'table',
    'thead',
    'tbody',
    'tfoot',
    'tr',
    'th',
    'td',
    'img',
    'a',
];
const ALLOWED_ATTR = [
    'style',
    'src',
    'alt',
    'width',
    'height',
    'href',
    'target',
    'rel',
    'colspan',
    'rowspan',
    'border',
    'cellpadding',
    'cellspacing',
];

interface SafeHtmlProps extends Omit<HTMLAttributes<HTMLDivElement>, 'dangerouslySetInnerHTML' | 'children'> {
    html?: string | null;
}

/** Renders trusted-by-allow-list HTML (question text, part descriptions). Never pass raw user HTML to dangerouslySetInnerHTML. */
export default function SafeHtml({ html, ...props }: SafeHtmlProps) {
    const clean = useMemo(() => DOMPurify.sanitize(html ?? '', { ALLOWED_TAGS, ALLOWED_ATTR }), [html]);

    return <div {...props} dangerouslySetInnerHTML={{ __html: clean }} />;
}
