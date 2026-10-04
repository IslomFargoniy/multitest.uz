import RegisterCard from '@/components/auth/register-card';
import LanguageBar from '@/components/language';
import AuthLayout from '@/layouts/auth-layout';
import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

export default function Register() {
    const { t } = useTranslation();

    return (
        <AuthLayout title={t('register.title')} description={t('register.description')}>
            <Head title={t('register.title')} />

            {/* Language Selection Bar - Positioned for focus */}
            <div className="mb-4 flex justify-center sm:mb-8">
                <LanguageBar />
            </div>

            {/* Main Registration Form Card */}
            <RegisterCard />

            {/* Help/Support Text (Optional) */}
            <p className="mt-4 text-center text-xs text-muted-foreground sm:mt-8">{t('register.terms_agreement')}</p>
        </AuthLayout>
    );
}
