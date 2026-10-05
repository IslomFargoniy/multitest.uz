import RegisterCard from '@/components/auth/register-card';
import AuthLayout from '@/layouts/auth-layout';
import { Head } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

export default function Register() {
    const { t } = useTranslation();

    return (
        <AuthLayout
            title={t('register.title', "Ro'yxatdan o'tish")}
            description={t('register.description', "Yangi hisob yarating va Speaking ko'nikmalaringizni sinab ko'ring")}
        >
            <Head title={t('register.title', "Ro'yxatdan o'tish")} />
            <RegisterCard />
        </AuthLayout>
    );
}
