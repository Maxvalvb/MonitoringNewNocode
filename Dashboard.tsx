import React, { FC, useState, useEffect } from 'react';
import { ChartBarIcon, CheckCircleIcon, XCircleIcon } from '../components/Icons.tsx';
import * as api from '../services/api.ts';

const StatCard = ({ title, value, icon, colorClass, isLoading }: { title: string, value: string, icon: React.ReactNode, colorClass: string, isLoading?: boolean}) => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClass}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-slate-500 font-medium">{title}</p>
            {isLoading ? 
                <div className="h-8 w-24 bg-slate-200 rounded-md animate-pulse mt-1"></div> :
                <p className="text-2xl font-bold text-slate-800">{value}</p>
            }
        </div>
    </div>
);

const DashboardPage: FC = () => {
    const [stats, setStats] = useState({
        totalChecks: "...",
        successfulChecks: "...",
        failedChecks: "...",
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const data = await api.getDashboardStats();
                setStats(data);
            } catch (err) {
                setError("Не удалось загрузить статистику.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="p-8 bg-slate-50 h-full">
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Дашборд</h1>
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">{error}</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <StatCard 
                    title="Всего проверок (24ч)"
                    value={stats.totalChecks}
                    icon={<ChartBarIcon className="w-6 h-6 text-blue-600" />}
                    colorClass="bg-blue-100"
                    isLoading={isLoading}
                />
                <StatCard 
                    title="Успешно"
                    value={stats.successfulChecks}
                    icon={<CheckCircleIcon className="w-6 h-6 text-green-600" />}
                    colorClass="bg-green-100"
                    isLoading={isLoading}
                />
                <StatCard 
                    title="Ошибки"
                    value={stats.failedChecks}
                    icon={<XCircleIcon className="w-6 h-6 text-red-600" />}
                    colorClass="bg-red-100"
                    isLoading={isLoading}
                />
            </div>
            <div className="mt-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Активность проверок</h2>
                <div className="h-64 bg-slate-100 rounded-lg flex items-center justify-center">
                    <p className="text-slate-400">Здесь будет график активности</p>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;