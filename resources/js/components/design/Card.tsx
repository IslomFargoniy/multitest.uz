import { cn } from '@/lib/utils';
import * as React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    as?: React.ElementType;
}

export function Card({ className, as: Component = 'div', ...props }: CardProps) {
    return <Component className={cn('bg-card border-border rounded-xl border p-6 shadow-sm dark:shadow-none', className)} {...props} />;
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn('flex flex-col gap-1.5 pb-4', className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return <h3 className={cn('text-foreground text-[18px] leading-tight font-bold', className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
    return <p className={cn('text-muted-foreground text-[14px] leading-normal', className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn('pt-0', className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn('flex items-center pt-4', className)} {...props} />;
}

export default Card;
