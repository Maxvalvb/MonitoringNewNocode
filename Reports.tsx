import React, { FC, useState, useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon } from '../components/Icons.tsx';
import * as api from '../services/api.ts';
import { type Report } from '../types.ts';

const ReportRow = ({ id, date, status, result }: Report) => (
    <tr className="border-b border-slate-200 last:border-b-0 hover:bg-slate-50">
        <td className="p-4 text-sm font-medium text-slate-700">{id}</td>
        <td className="p-4 text-sm text-slate-500">{date}</td>
        <td className="p-4">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {status === 'success' ? <CheckCircleIcon className="w-4 h-4" /> : <XCircleIcon className="w-4 h-4" />}
                {status === 'success' ? 'Успешно' : 'Ошибка'}
            </span>
        </td>
        <td className="p-4 text-sm text-slate-500">{result}</td>
        <td className="p-4 text-right">
            <button className="font-medium text-blue-600 hover:text-blue-800 text-sm">Подробнее</button>
        </td>
    </tr>
);

const ReportsPage: FC = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const data = await api.getReports(page);
                setReports(data);
            } catch (err) {
                setError("Не удалось загрузить отчеты.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchReports();
    }, [page]);
    
    return (
        <div className="p-8 bg-slate-50 h-full">
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Отчеты по проверкам</h1>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[600px]">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="p-4 text-sm font-semibold text-slate-600">ID проверки</th>
                                <th className="p-4 text-sm font-semibold text-slate-600">Дата</th>
                                <th className="p-4 text-sm font-semibold text-slate-600">Статус</th>
                                <th className="p-4 text-sm font-semibold text-slate-600">Результат</th>
                                <th className="p-4"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading && (
                                <tr>
                                    <td colSpan={5} className="text-center p-8 text-slate-500">
                                        Загрузка отчетов...
                                    </td>
                                </tr>
                            )}
                            {error && (
                                <tr>
                                    <td colSpan={5} className="text-center p-8 text-red-500">
                                        {error}
                                    </td>
                                </tr>
                            )}
                            {!isLoading && !error && reports.map(report => <ReportRow key={report.id} {...report} />)}
                             {!isLoading && !error && reports.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center p-8 text-slate-500">
                                        Нет доступных отчетов.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
             <div className="mt-6 flex justify-between items-center">
                <p className="text-sm text-slate-500">Показано {reports.length} из 48 отчетов</p>
                <div className="flex gap-2">
                    <button className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50" disabled={page <= 1}>Назад</button>
                    <button className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50">Вперед</button>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;