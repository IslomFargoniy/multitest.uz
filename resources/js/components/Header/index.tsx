import { Icon } from '@iconify/react';
import { Link, usePage } from '@inertiajs/react';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import AppearanceTabs from '@/components/appearance-tabs';
import LoginCard from '@/components/auth/login-card';
import RegisterCard from '@/components/auth/register-card';
import LanguageBar from '@/components/language';
import FindMockModal from '@/components/mock/find-mock-modal';
import type { SharedData } from '@/types';
import HeaderLink from '../Header/Navigation/HeaderLink';
import { headerData } from '../Header/Navigation/menuData';
import MobileHeaderLink from '../Header/Navigation/MobileHeaderLink';
import Logo from './Logo';

const Header: React.FC = () => {
    const { t } = useTranslation();
    const { auth } = usePage<SharedData>().props;

    const [navbarOpen, setNavbarOpen] = useState(false);
    const [sticky, setSticky] = useState(false);
    const [isSignInOpen, setIsSignInOpen] = useState(false);
    const [isSignUpOpen, setIsSignUpOpen] = useState(false);

    const signInRef = useRef<HTMLDivElement>(null);
    const signUpRef = useRef<HTMLDivElement>(null);
    const mobileMenuRef = useRef<HTMLDivElement>(null);

    const handleScroll = () => {
        setSticky(window.scrollY >= 80);
    };

    const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;
        if (isSignInOpen && signInRef.current && !signInRef.current.contains(target)) setIsSignInOpen(false);
        if (isSignUpOpen && signUpRef.current && !signUpRef.current.contains(target)) setIsSignUpOpen(false);
        if (navbarOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(target)) setNavbarOpen(false);
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [navbarOpen, isSignInOpen, isSignUpOpen]);

    useEffect(() => {
        document.body.style.overflow = isSignInOpen || isSignUpOpen || navbarOpen ? 'hidden' : '';
    }, [isSignInOpen, isSignUpOpen, navbarOpen]);

    return (
        <header
            className={`fixed top-0 z-40 w-full transition-all duration-300 ${
                sticky ? 'border-border bg-card border-b py-3 shadow-xs' : 'bg-transparent py-5'
            }`}
        >
            <div className="container mx-auto flex items-center justify-between px-4 md:max-w-screen-md lg:max-w-screen-xl">
                <Logo />

                {/* Desktop Navigation */}
                <nav className="hidden items-center gap-8 lg:flex">
                    <div className="flex items-center gap-6">
                        {headerData.map((item) => (
                            <HeaderLink key={item.label} item={item} />
                        ))}

                        <FindMockModal />
                    </div>

                    <div className="bg-border h-5 w-px" />

                    <LanguageBar />

                    <div className="flex items-center gap-3">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-xs transition-colors"
                            >
                                <Icon icon="tabler:layout-dashboard" className="text-lg" />
                                {t('auth.profile')}
                            </Link>
                        ) : (
                            <>
                                <button
                                    className="text-muted-foreground hover:text-foreground cursor-pointer px-4 py-2 text-sm font-semibold transition-colors"
                                    onClick={() => setIsSignInOpen(true)}
                                >
                                    {t('auth.sign_in')}
                                </button>
                                <button
                                    className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer rounded-xl px-6 py-2.5 text-sm font-semibold shadow-xs transition-colors active:scale-95"
                                    onClick={() => setIsSignUpOpen(true)}
                                >
                                    {t('auth.sign_up')}
                                </button>
                            </>
                        )}
                    </div>
                </nav>

                {/* Mobile Menu Toggle */}
                <button
                    onClick={() => setNavbarOpen(true)}
                    className="bg-secondary text-foreground flex h-10 w-10 items-center justify-center rounded-xl lg:hidden"
                >
                    <Icon icon="tabler:menu-2" className="text-2xl" />
                </button>
            </div>

            {/* Auth Modals */}
            {(isSignInOpen || isSignUpOpen) && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
                    <div
                        ref={isSignInOpen ? signInRef : signUpRef}
                        className="border-border bg-card relative w-full max-w-[480px] overflow-hidden rounded-2xl border p-8 shadow-2xl"
                    >
                        <button
                            onClick={() => {
                                setIsSignInOpen(false);
                                setIsSignUpOpen(false);
                            }}
                            className="bg-secondary text-muted-foreground hover:text-foreground absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-full"
                        >
                            <Icon icon="tabler:x" className="text-lg" />
                        </button>

                        <div className="mb-6 flex justify-center">
                            <Logo />
                        </div>

                        {isSignInOpen ? <LoginCard /> : <RegisterCard />}
                    </div>
                </div>
            )}

            {/* Mobile Drawer */}
            <div className={`fixed inset-0 z-50 lg:hidden ${navbarOpen ? 'visible' : 'invisible'}`}>
                <div
                    className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${navbarOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setNavbarOpen(false)}
                />

                <div
                    ref={mobileMenuRef}
                    className={`bg-card border-border absolute top-0 right-0 z-10 h-full w-full max-w-xs border-l shadow-2xl transition-transform duration-300 ease-in-out ${navbarOpen ? 'translate-x-0' : 'translate-x-full'}`}
                >
                    <div className="flex h-full flex-col">
                        {/* Sidebar Header */}
                        <div className="border-border flex items-center justify-between border-b p-5">
                            <Logo />
                            <button
                                onClick={() => setNavbarOpen(false)}
                                className="bg-secondary text-muted-foreground hover:text-foreground flex h-9 w-9 items-center justify-center rounded-full"
                            >
                                <Icon icon="tabler:x" className="text-xl" />
                            </button>
                        </div>

                        {/* Nav Links Area */}
                        <nav className="flex-1 space-y-1 overflow-y-auto p-5">
                            {headerData.map((item) => (
                                <MobileHeaderLink key={item.label} item={item} />
                            ))}
                            <div className="pt-2">
                                <FindMockModal />
                            </div>
                        </nav>

                        {/* Sidebar Footer Area */}
                        <div className="border-border bg-surface-2 mt-auto border-t p-5">
                            <AppearanceTabs className="bg-secondary mb-4 rounded-xl p-1" />

                            {!auth.user ? (
                                <div className="grid grid-cols-2 gap-2.5">
                                    <button
                                        className="border-border bg-card text-foreground rounded-xl border py-2.5 text-sm font-semibold"
                                        onClick={() => {
                                            setIsSignInOpen(true);
                                            setNavbarOpen(false);
                                        }}
                                    >
                                        {t('auth.sign_in')}
                                    </button>
                                    <button
                                        className="bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-semibold shadow-xs"
                                        onClick={() => {
                                            setIsSignUpOpen(true);
                                            setNavbarOpen(false);
                                        }}
                                    >
                                        {t('auth.sign_up')}
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    href={route('dashboard')}
                                    className="bg-primary text-primary-foreground flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold shadow-xs"
                                >
                                    <Icon icon="tabler:layout-dashboard" className="text-lg" />
                                    {t('auth.profile')}
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
