import { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon({ className, alt = 'MultiTest', ...props }: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src="/images/logo/logo-no-bg.png"
            alt={alt}
            className={`object-contain select-none ${className || ''}`}
            {...props}
        />
    );
}
