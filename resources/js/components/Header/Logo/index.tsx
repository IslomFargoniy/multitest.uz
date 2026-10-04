import React from 'react';
import { Link } from '@inertiajs/react';

const Logo: React.FC = () => {
    return (
        <Link href={route('dashboard')} className="flex items-center gap-2">
            <span className="font-display text-2xl font-black tracking-tight text-foreground">
                Multi<span className="text-primary">Test</span>
                <span className="text-xs font-semibold text-muted-foreground ml-0.5">.uz</span>
            </span>
        </Link>
    );
};

export default Logo;
