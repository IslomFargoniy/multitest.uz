import { StatItem } from '@/types';
import { useIsDarkMode } from '@/hooks/use-is-dark-mode';
import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    Title,
    Tooltip,
    TooltipItem,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Props {
    daily_users: StatItem[];
    daily_attempts: StatItem[];
}

function fmt(n: number): string {
    return n > 99 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

const datalabelPlugin = {
    id: 'datalabel',
    afterDatasetsDraw(chart: ChartJS) {
        const ctx = chart.ctx;
        chart.data.datasets.forEach((_dataset, datasetIndex) => {
            const meta = chart.getDatasetMeta(datasetIndex);
            meta.data.forEach((bar, index) => {
                const value = chart.data.datasets[datasetIndex].data[index] as number;
                if (!value) return;
                const tooltipPos = bar.tooltipPosition(false);
                if (!tooltipPos || tooltipPos.x == null || tooltipPos.y == null) return;
                const { x, y } = tooltipPos;
                ctx.save();
                ctx.fillStyle = '#64748b';
                ctx.font = '600 12px Manrope, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.fillText(fmt(value), x, y - 2);
                ctx.restore();
            });
        });
    },
};

export default function DailyStatsChart({ daily_users, daily_attempts }: Props) {
    const { t } = useTranslation();
    const isDark = useIsDarkMode();

    const allDates = Array.from(
        new Set([
            ...daily_users.map((d) => d.day_date),
            ...daily_attempts.map((d) => d.day_date),
        ]),
    ).sort();

    const usersByDate = Object.fromEntries(daily_users.map((d) => [d.day_date, d]));
    const attemptsByDate = Object.fromEntries(daily_attempts.map((d) => [d.day_date, d]));

    const newUsersData = allDates.map((date) => usersByDate[date]?.items_count ?? 0);
    const uniqueAttemptUsers = allDates.map((date) => attemptsByDate[date]?.unique_users_count ?? 0);
    const repeatAttempts = allDates.map((date) => {
        const total = attemptsByDate[date]?.items_count ?? 0;
        const unique = attemptsByDate[date]?.unique_users_count ?? 0;
        return Math.max(0, total - unique);
    });

    const labels = allDates.map((d) =>
        new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    );

    const chartData = {
        labels,
        datasets: [
            {
                label: t('stats.new_users', 'New Users'),
                data: newUsersData,
                backgroundColor: 'hsla(220, 90%, 56%, 0.8)',
                hoverBackgroundColor: 'hsl(220, 90%, 56%)',
                borderRadius: 4,
                stack: 'stack0',
            },
            {
                label: t('stats.unique_attempt_users', 'Unique Attempt Users'),
                data: uniqueAttemptUsers,
                backgroundColor: 'hsla(158, 64%, 52%, 0.8)',
                hoverBackgroundColor: 'hsl(158, 64%, 52%)',
                borderRadius: 4,
                stack: 'stack1',
            },
            {
                label: t('stats.repeat_attempts', 'Repeat Attempts'),
                data: repeatAttempts,
                backgroundColor: 'hsla(45, 93%, 47%, 0.8)',
                hoverBackgroundColor: 'hsl(45, 93%, 47%)',
                borderRadius: 4,
                stack: 'stack1',
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                align: 'end' as const,
                labels: {
                    usePointStyle: true,
                    pointStyle: 'circle' as const,
                    font: { size: 12, weight: 600 as const },
                    color: isDark ? '#94a3b8' : '#64748b',
                },
            },
            tooltip: {
                backgroundColor: isDark ? '#141820' : '#ffffff',
                titleColor: isDark ? '#f1f5f9' : '#0b0e14',
                bodyColor: isDark ? '#94a3b8' : '#475569',
                borderColor: isDark ? '#232936' : '#e2e8f0',
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    footer: (items: TooltipItem<'bar'>[]) => {
                        const hasAttempts = items.some((item) => item.datasetIndex > 0);
                        if (!hasAttempts) return;

                        const date = allDates[items[0].dataIndex] ?? '';
                        const total = attemptsByDate[date]?.items_count ?? 0;
                        return `Total attempts: ${total}`;
                    },
                },
            },
        },
        scales: {
            x: {
                stacked: true,
                grid: { display: false },
                ticks: { color: isDark ? '#64748b' : '#94a3b8', maxRotation: 45 },
            },
            y: {
                stacked: true,
                beginAtZero: true,
                ticks: { color: isDark ? '#64748b' : '#94a3b8' },
                grid: {
                    color: isDark ? 'rgba(35, 41, 54, 0.6)' : 'rgba(226, 232, 240, 0.6)',
                },
            },
        },
    };

    return (
        <div className="w-full rounded-xl border border-border bg-card p-6 shadow-sm dark:shadow-none">
            <div className="mb-6">
                <h3 className="text-base font-bold text-foreground">
                    {t('stats.daily_activity', 'Daily Activity (Last 30 Days)')}
                </h3>
                <p className="text-sm text-muted-foreground">{t('stats.users_and_attempts', 'Users registrations and attempt stats')}</p>
            </div>
            <div className="h-[350px] w-full">
                <Bar
                    key={isDark ? 'dark' : 'light'}
                    data={chartData}
                    options={options}
                    plugins={[datalabelPlugin]}
                />
            </div>
        </div>
    );
}
