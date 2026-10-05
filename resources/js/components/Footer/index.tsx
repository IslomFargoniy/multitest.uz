import { Icon } from '@iconify/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import Logo from '../Header/Logo';
import { headerData } from '../Header/Navigation/menuData';

const Footer: React.FC = () => {
    const { t } = useTranslation();

    const domain = typeof window !== 'undefined' ? window.location.hostname : 'multitest.uz';

    const capitalizeDomain = domain
        .toLowerCase()
        .split('.')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join('.');

    const socialLinks = [
        { icon: 'tabler:brand-telegram', href: 'https://t.me/IslomFargniy' },
        { icon: 'tabler:brand-instagram', href: 'https://instagram.com' },
        { icon: 'tabler:brand-youtube', href: 'https://youtube.com' },
    ];

    return (
        <footer id="contact" className="border-t border-border bg-card/40 py-14">
            <div className="container mx-auto px-6 md:max-w-screen-md lg:max-w-screen-xl">
                <div className="grid grid-cols-1 gap-x-16 gap-y-12 sm:grid-cols-2 lg:grid-cols-12">
                    {/* Brand Section */}
                    <div className="col-span-1 sm:col-span-2 lg:col-span-5">
                        <Logo />
                        <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
                            <span className="font-bold text-foreground">{capitalizeDomain}</span> —{' '}
                            {t('footer.description')}
                        </p>
                        <div className="mt-6 flex items-center gap-3">
                            {socialLinks.map((social, idx) => (
                                <a
                                    key={idx}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href={social.href}
                                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-secondary text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
                                >
                                    <Icon icon={social.icon} className="text-xl" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="col-span-1 lg:col-span-3">
                        <h3 className="mb-4 text-xs font-bold tracking-wider text-foreground uppercase">
                            {t('footer.quick_links')}
                        </h3>
                        <ul className="space-y-2.5">
                            {headerData.map((item, index) => (
                                <li key={index}>
                                    <a
                                        href={item.href}
                                        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        {t(item.label)}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="col-span-1 lg:col-span-4">
                        <h3 className="mb-4 text-xs font-bold tracking-wider text-foreground uppercase">
                            {t('footer.contact')}
                        </h3>
                        <div className="space-y-3.5">
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                                    <Icon icon="tabler:map-pin" className="text-lg" />
                                </div>
                                <span className="text-sm font-medium text-muted-foreground">{t('footer.location')}</span>
                            </div>

                            <a href="tel:+998911157709" className="group flex items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                    <Icon icon="tabler:phone" className="text-lg" />
                                </div>
                                <span className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                                    +998 91 115 77 09
                                </span>
                            </a>

                            <a href="https://t.me/IslomFargniy" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                    <Icon icon="tabler:brand-telegram" className="text-lg" />
                                </div>
                                <span className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                                    {t('footer.support_telegram')}
                                </span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 md:flex-row">
                    <span className="text-center text-xs font-medium text-muted-foreground">
                        © {new Date().getFullYear()} <span className="font-semibold text-foreground">{capitalizeDomain}</span>.{' '}
                        {t('footer.rights_reserved')}
                    </span>
                    <div className="flex gap-6 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                        <a href="#" className="transition-colors hover:text-foreground">
                            {t('footer.privacy')}
                        </a>
                        <a href="#" className="transition-colors hover:text-foreground">
                            {t('footer.terms')}
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
