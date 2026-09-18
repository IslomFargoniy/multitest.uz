import React from 'react';
import Chart from 'react-apexcharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { useIsDarkMode } from '@/hooks/use-is-dark-mode';
import { cn } from '@/lib/utils';
import { CardDescription } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';

interface SkillsRadarChartProps {
    className?: string;
    skills?: {
        fluency: number;
        vocabulary: number;
        grammar: number;
        pronunciation: number;
    };
}

export default function SkillsRadarChart({ skills, className }: SkillsRadarChartProps) {
    const { t } = useTranslation();
    const isDark = useIsDarkMode();
    const isMobile = useIsMobile();

    const data = skills || {
        fluency: 65,
        vocabulary: 70,
        grammar: 60,
        pronunciation: 75,
    };

    const options: any = {
        chart: {
            toolbar: { show: false },
            background: 'transparent',
            dropShadow: {
                enabled: true,
                blur: 1,
                left: 1,
                top: 1,
                opacity: isDark ? 0.3 : 0.1,
            },
            offsetY: isMobile ? 10 : 0,
        },
        theme: {
            mode: isDark ? 'dark' : 'light',
        },
        stroke: {
            width: 2,
            colors: ['#2481cc'],
        },
        fill: {
            opacity: isDark ? 0.4 : 0.2,
            colors: ['#2481cc'],
        },
        markers: {
            size: isMobile ? 3 : 4,
            colors: ['#2481cc'],
            strokeColor: isDark ? '#1e293b' : '#fff',
            strokeWidth: 2,
        },
        xaxis: {
            categories: [
                t('skills.fluency'),
                t('skills.vocabulary'),
                t('skills.grammar'),
                t('skills.pronunciation'),
            ],
            labels: {
                style: {
                    colors: Array(4).fill(isDark ? '#94a3b8' : '#64748b'),
                    fontSize: isMobile ? '9px' : '11px',
                    fontWeight: 700,
                },
                offsetY: 5,
            },
        },
        yaxis: {
            show: false,
            min: 0,
            max: 100,
        },
        plotOptions: {
            radar: {
                size: isMobile ? 75 : 90,
                polygons: {
                    strokeColors: isDark ? '#334155' : '#e2e8f0',
                    fill: {
                        colors: isDark ? ['#1e293b', '#0f172a'] : ['#f8fafc', '#fff'],
                    },
                },
            },
        },
        colors: ['#2481cc'],
        legend: { show: false },
        grid: { show: false },
    };

    const series = [
        {
            name: t('skills.overall_level'),
            data: [data.fluency, data.vocabulary, data.grammar, data.pronunciation],
        },
    ];

    return (
        <Card className={cn("rounded-2xl border-border bg-card shadow-sm flex flex-col", className)}>

            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-black tracking-tight text-slate-800 dark:text-white">
                    {t('skills.skills_analysis')}
                </CardTitle>
                <CardDescription className="text-xs">
                    {t('skills.skills_analysis_description', 'Detailed analysis of your language proficiency metrics.')}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 p-0 sm:p-6">
                <div className="flex h-[280px] sm:h-[300px] items-center justify-center overflow-hidden">
                    <Chart 
                        key={`${isDark ? 'dark' : 'light'}-${isMobile ? 'mobile' : 'desktop'}`} 
                        options={options} 
                        series={series} 
                        type="radar" 
                        width="100%" 
                        height="100%" 
                    />
                </div>
            </CardContent>
        </Card>
    );
}
