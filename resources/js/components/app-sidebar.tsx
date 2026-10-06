import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { Auth, Language, type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ClipboardList, FileText, Folder, Github, Globe, GraduationCap, History, Languages, LayoutDashboard, Send, Smartphone, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { t, i18n } = useTranslation();

    const footerNavItems: NavItem[] = [
        {
            title: t('sidebar.repository'),
            href: 'https://github.com/IslomFargoniy',
            icon: Github,
        },
        {
            title: t('sidebar.telegram'),
            href: 'https://t.me/IslomFargniy',
            icon: Send,
        },
    ];

    const { auth } = usePage().props as unknown as { auth?: Auth };
    const isAdmin = auth?.user?.roles?.some((role) => role.name === 'Admin');
    const isTeacher = auth?.user?.roles?.some((role) => role.name === 'Teacher');

    // 1️⃣ State FIRST
    const [languages, setLanguages] = useState<Language[]>([]);
    const [loading, setLoading] = useState(false);

    // 2️⃣ Effects SECOND
    useEffect(() => {
        const fetchTests = async () => {
            setLoading(true);
            try {
                const response = await fetch(route('sidebar.language.json'));
                const result = await response.json();

                const list: Language[] = Array.isArray(result) ? result : Array.isArray(result.data) ? result.data : [];

                setLanguages(list);
            } catch (e) {
                console.error(e);
                setLanguages([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTests();
    }, []);

    // 3️⃣ Memo LAST
    const filteredNavItems = useMemo((): NavItem[] => {
        const baseItems: NavItem[] = [
            { title: t('sidebar.dashboard'), href: '/dashboard', icon: LayoutDashboard },
            { title: t('sidebar.user'), href: '/user', icon: Users },
            { title: t('sidebar.play_store_testers', 'Play Store Testerlar'), href: '/play-store-testers', icon: Smartphone },
            { title: t('sidebar.test'), href: '/test', icon: FileText },
            { title: t('sidebar.mock'), href: '/mock', icon: GraduationCap },
            { title: t('sidebar.attempt'), href: '/attempt', icon: History },
        ];

        const languageItems: NavItem[] = languages.map((lang) => ({
            title: (i18n.language === 'uz' ? lang.name_uz : i18n.language === 'ru' ? lang.name_ru : lang.name_en) + ' (' + lang.tests_count + ')',
            href: `/language/${lang.id}`,
            icon: Languages,
        }));

        return [...baseItems, ...languageItems].filter((item) => {
            if (item.href === '/user' && !isAdmin) return false;
            if (item.href === '/play-store-testers' && !isAdmin) return false;
            if (item.href === '/mock' && !isAdmin && !isTeacher) return false;
            return true;
        });
    }, [languages, isAdmin, isTeacher, i18n.language]);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={filteredNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
