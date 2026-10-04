import { HeaderItem } from '@/types/menu';
import { Icon } from '@iconify/react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const MobileHeaderLink: React.FC<{ item: HeaderItem }> = ({ item }) => {
    const { t } = useTranslation();
    const [submenuOpen, setSubmenuOpen] = useState(false);

    const handleToggle = (e: React.MouseEvent) => {
        if (item.submenu) {
            e.preventDefault();
            setSubmenuOpen(!submenuOpen);
        }
    };

    return (
        <div className="relative w-full border-b border-border last:border-0">
            <a
                href={item.href || '#'}
                onClick={handleToggle}
                className={`flex w-full items-center justify-between px-2 py-3.5 text-sm font-semibold transition-colors ${submenuOpen ? 'text-primary' : 'text-muted-foreground hover:text-foreground'} `}
            >
                {t(item.label)}

                {item.submenu && (
                    <Icon
                        icon="tabler:chevron-down"
                        className={`text-lg transition-transform duration-300 ${submenuOpen ? 'rotate-180 text-primary' : 'text-muted-foreground'}`}
                    />
                )}
            </a>

            {/* Submenu rendering */}
            {submenuOpen && item.submenu && (
                <div className="mb-2 ml-4 overflow-hidden rounded-xl border-l-2 border-border bg-surface-2 py-1">
                    {item.submenu.map((subItem, index) => (
                        <a
                            key={index}
                            href={subItem.href || '#'}
                            className="block px-4 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
                        >
                            {t(subItem.label)}
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MobileHeaderLink;
