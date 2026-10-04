import { WeeklyStatItem } from '@/types';
import { useIsDarkMode } from '@/hooks/use-is-dark-mode';
import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    LinearScale,
    Title,
    Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip);

interface Props {
    data: WeeklyStatItem[];
    title: string;
}

export default function WeeklyAttemptsChart({ data, title }: Props) {
    const isDark = useIsDarkMode();
    const { t } = useTranslation();

    const weekdays = [
        t('weekdays.monday', 'Dushanba'),
        t('weekdays.tuesday', 'Seshanba'),
        t('weekdays.wednesday', 'Chorshanba'),
        t('weekdays.thursday', 'Payshanba'),
        t('weekdays.friday', 'Juma'),
        t('weekdays.saturday', 'Shanba'),
        t('weekdays.sunday', 'Yakshanba'),
    ];

    // Fill Mon–Sun (1–7) with 0 by default
    const counts = Array(7).fill(0);
    data.forEach((item) => {
        const idx = item.weekday - 1; // 1-indexed → 0-indexed
        if (idx >= 0 && idx < 7) counts[idx] = item.items_count;
    });

    const chartData = {
        labels: weekdays,
        datasets: [
            {
                label: title,
                data: counts,
                backgroundColor: 'rgba(36, 129, 204, 0.75)',
                hoverBackgroundColor: 'rgba(36, 129, 204, 1)',
                borderRadius: 8,
                borderSkipped: false,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: {
                display: true,
                text: title,
                color: isDark ? '#f1f5f9' : '#1e293b',
                font: { size: 14, weight: 700 as const },
                padding: { bottom: 16 },
            },
            tooltip: {
                backgroundColor: '#1e293b',
                titleColor: '#fff',
                bodyColor: '#cbd5e1',
                padding: 12,
                cornerRadius: 12,
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: isDark ? '#64748b' : '#94a3b8' },
            },
            y: {
                beginAtZero: true,
                ticks: { color: isDark ? '#64748b' : '#94a3b8' },
                grid: {
                    color: isDark ? 'rgba(51,65,85,0.4)' : 'rgba(226,232,240,0.4)',
                },
            },
        },
    };

    return (
        <div className="w-full rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="h-[300px] w-full">
                <Bar key={isDark ? 'dark' : 'light'} data={chartData} options={options} />
            </div>
        </div>
    );
}
