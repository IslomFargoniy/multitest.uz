import { cn } from '@/lib/utils';
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

/** Wraps every table in a horizontal scroll box. Runs after sanitizing, so user HTML can never set this class itself. */
function wrapTables(html: string): string {
    if (typeof DOMParser === 'undefined' || !/<table/i.test(html)) return html;

    const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');
    doc.querySelectorAll('table').forEach((table) => {
        const wrapper = doc.createElement('div');
        wrapper.className = 'rich-table-scroll';
        table.replaceWith(wrapper);
        wrapper.appendChild(table);
    });

    return doc.body.innerHTML;
}

/** Renders allow-listed HTML (question text, part descriptions). Never pass raw user HTML to dangerouslySetInnerHTML. */
export default function SafeHtml({ html, className, ...props }: SafeHtmlProps) {
    const clean = useMemo(() => wrapTables(DOMPurify.sanitize(html ?? '', { ALLOWED_TAGS, ALLOWED_ATTR })), [html]);

    return <div {...props} className={cn('rich-content', className)} dangerouslySetInnerHTML={{ __html: clean }} />;
}
