import { type AttemptPart } from '@/types';

type StepTabsProps = {
    attempt_parts: AttemptPart[];
    active: number;
};

export default function StepTabs({ attempt_parts, active }: StepTabsProps) {
    const activeIndex = attempt_parts.findIndex((p) => p.id === active);

    return (
        <div className="flex w-full items-center justify-center gap-3 py-2">
            {attempt_parts.map((p, index) => {
                const isCompleted = index < activeIndex;
                const isActive = p.id === active;

                return (
                    <div key={p.id} className="flex max-w-[140px] flex-1 flex-col items-center gap-1.5">
                        {/* 6px Progress Bar */}
                        <div
                            className={`h-1.5 w-full rounded-full transition-colors duration-300 ${
                                isActive ? 'bg-chart' : isCompleted ? 'bg-chart/60' : 'bg-border'
                            }`}
                        />
                        {/* Label under */}
                        <span
                            className={`max-w-full truncate text-xs font-medium ${
                                isActive ? 'text-nav-active-fg font-bold' : 'text-muted-foreground'
                            }`}
                        >
                            {p.part?.name}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
