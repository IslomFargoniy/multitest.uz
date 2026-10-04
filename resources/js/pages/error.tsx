import { Button } from '@/components/ui/button';
import { Head, Link } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

export default function ErrorPage({ status }: { status: number }) {
    const { t } = useTranslation();

    const known = [403, 404, 419, 500, 503].includes(status) ? status : 500;
    const title = t(`error_page.${known}.title`, {
        defaultValue: { 403: 'Access denied', 404: 'Page not found', 419: 'Session expired', 500: 'Server error', 503: 'Service unavailable' }[known],
    });
    const description = t(`error_page.${known}.description`, {
        defaultValue: {
            403: 'You do not have permission to view this page.',
            404: 'The page you are looking for does not exist or was moved.',
            419: 'Your session expired. Please refresh the page and try again.',
            500: 'Something went wrong on our side. Please try again later.',
            503: 'We are doing maintenance. Please come back soon.',
        }[known],
    });

    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
            <Head title={`${status} - ${title}`} />
            <p className="text-6xl font-black text-primary">{status}</p>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="max-w-md text-muted-foreground">{description}</p>
            <Button asChild>
                <Link href="/">{t('error_page.home', { defaultValue: 'Go to home page' })}</Link>
            </Button>
        </div>
    );
}
