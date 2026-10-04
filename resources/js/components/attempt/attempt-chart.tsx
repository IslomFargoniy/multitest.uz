import { Attempt } from '@/types';
import { useIsDarkMode } from '@/hooks/use-is-dark-mode';
import {
    CategoryScale,
    Chart as ChartJS,
    Filler,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

export default function AttemptsChart({ attempts, className }: { attempts: Attempt[]; className?: string }) {
    const { t } = useTranslation();
    const isDark = useIsDarkMode();

    const labels = attempts.map((a) =>
        new Date(a.finished_at || a.started_at).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
        }),
    );

    const scores = attempts.map((a) => a.score ?? a.ai_score_avg ?? 0);
    const highestScore = Math.max(...scores, 9);
    const chartMax = highestScore > 9 ? Math.ceil(highestScore / 5) * 5 + 5 : 9;

    const chartData = {
        labels,
        datasets: [
            {
                label: t('exam_attempts.score', 'Score'),
                data: scores,
                fill: true,
                borderColor: 'hsl(220, 90%, 56%)',
                backgroundColor: 'rgba(59, 130, 246, 0.12)',
                tension: 0.4,
                pointBackgroundColor: 'hsl(220, 90%, 56%)',
                pointBorderColor: isDark ? '#0b0e14' : '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: isDark ? '#141820' : '#ffffff',
                titleColor: isDark ? '#f1f5f9' : '#0b0e14',
                bodyColor: isDark ? '#94a3b8' : '#475569',
                borderColor: isDark ? '#232936' : '#e2e8f0',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: isDark ? '#64748b' : '#94a3b8' },
            },
            y: {
                min: 0,
                max: chartMax,
                ticks: {
                    stepSize: highestScore > 10 ? undefined : 1,
                    color: isDark ? '#64748b' : '#94a3b8',
                },
                grid: {
                    color: isDark ? 'rgba(35, 41, 54, 0.6)' : 'rgba(226, 232, 240, 0.6)',
                },
            },
        },
    };

    return (
        <Card className={cn("rounded-xl border border-border bg-card shadow-sm dark:shadow-none", className)}>
            <CardHeader>
                <CardTitle className="text-base font-bold text-foreground">
                    {t('exam_attempts.performance')}
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                    {t('exam_attempts.track_and_review_student_performance')}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <Line key={isDark ? 'dark' : 'light'} data={chartData} options={options} />
                </div>
            </CardContent>
        </Card>
    );
}
