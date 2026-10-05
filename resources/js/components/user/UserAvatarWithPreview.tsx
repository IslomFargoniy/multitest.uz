import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { ExternalLink, UserCircle, ZoomIn } from 'lucide-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface UserAvatarWithPreviewProps {
    src?: string | null;
    name?: string;
    id?: number | string;
    username?: string | null;
    role?: string | null;
    sizeClass?: string;
    roundedClass?: string;
    showStatusDot?: boolean;
}

export default function UserAvatarWithPreview({
    src,
    name,
    id,
    username,
    role,
    sizeClass = 'h-10 w-10',
    roundedClass = 'rounded-full',
    showStatusDot = false,
}: UserAvatarWithPreviewProps) {
    const { t } = useTranslation();
    const [hasError, setHasError] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // Compute initials from name: e.g. "Quralay Asanova" -> "QA"
    const getInitials = (userName?: string): string => {
        if (!userName) return 'U';
        const parts = userName.trim().split(/\s+/).filter(Boolean);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return userName.slice(0, 2).toUpperCase();
    };

    const hasValidImage = Boolean(src && !hasError);

    // If there is no image or the image failed to load (404/broken), render graceful initials fallback
    if (!hasValidImage) {
        return (
            <div className="relative shrink-0 select-none">
                <div
                    className={cn(
                        'bg-primary/10 text-primary border-border flex items-center justify-center border font-bold',
                        roundedClass,
                        sizeClass,
                    )}
                >
                    {name ? (
                        <span className="text-xs font-extrabold uppercase tracking-tight">{getInitials(name)}</span>
                    ) : (
                        <UserCircle className="text-muted-foreground h-5 w-5" />
                    )}
                </div>
                {showStatusDot && (
                    <span className="border-card bg-success absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2" />
                )}
            </div>
        );
    }

    // When valid image exists, allow clicking to view enlarged in modal
    return (
        <>
            <div className="relative shrink-0 select-none">
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen(true);
                    }}
                    title={t('common.view_photo', "Rasmni kattalashtirib ko'rish")}
                    className={cn(
                        'group relative block overflow-hidden border border-border focus:outline-none focus:ring-2 focus:ring-primary/60 transition-transform active:scale-95',
                        roundedClass,
                        sizeClass,
                    )}
                >
                    <img
                        src={src!}
                        alt={name || 'Avatar'}
                        onError={() => setHasError(true)}
                        className={cn('h-full w-full object-cover transition-all duration-200 group-hover:scale-105', roundedClass)}
                    />
                    {/* Hover magnifying overlay */}
                    <span
                        className={cn(
                            'bg-black/35 absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white backdrop-blur-[1px]',
                            roundedClass,
                        )}
                    >
                        <ZoomIn className="h-4 w-4 drop-shadow-sm" />
                    </span>
                </button>
                {showStatusDot && (
                    <span className="border-card bg-success absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2" />
                )}
            </div>

            {/* Enlarged Modal Preview */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-card/95 backdrop-blur-xl border border-border shadow-2xl">
                    <DialogTitle className="sr-only">{name || 'Avatar preview'}</DialogTitle>
                    <div className="relative flex flex-col items-center p-6 text-center">
                        {/* High-res Enlarged Image Frame */}
                        <div className="relative mb-4 mt-2 overflow-hidden rounded-2xl border border-border bg-surface shadow-md">
                            <img
                                src={src!}
                                alt={name || 'Avatar'}
                                className="max-h-[360px] max-w-[320px] sm:max-w-[380px] w-full object-contain aspect-square"
                            />
                        </div>

                        {/* User Details */}
                        {name && <h3 className="text-foreground text-lg font-bold tracking-tight">{name}</h3>}
                        <div className="text-muted-foreground mt-1 flex flex-wrap items-center justify-center gap-2 text-xs">
                            {id && <span className="font-mono font-semibold">ID: #{id}</span>}
                            {role && (
                                <span className="bg-secondary text-secondary-foreground border-border rounded-md border px-2 py-0.5 font-bold">
                                    {role}
                                </span>
                            )}
                            {username && <span className="text-primary font-medium">@{username}</span>}
                        </div>

                        {/* Open Original Link */}
                        <div className="mt-5 flex w-full justify-center">
                            <a
                                href={src!}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-secondary hover:bg-secondary/80 text-secondary-foreground border-border inline-flex items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-bold transition-colors"
                            >
                                <ExternalLink className="h-3.5 w-3.5" />
                                {t('common.open_original', 'Asl nusxani ochish')}
                            </a>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
