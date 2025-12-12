'use client';

import { useState } from 'react';
import type { Subscription, Income } from '@/lib/generated/client';
import { formatCurrency } from '@/lib/utils';

interface CostSummaryProps {
    expenses: Subscription[];
    incomes: Income[];
}

export function CostSummary({ expenses, incomes }: CostSummaryProps) {
    const [view, setView] = useState<'monthly' | 'yearly'>('monthly');

    const calculateMonthly = (frequency: string, amount: number) => {
        if (frequency.toUpperCase() === 'MONTHLY') return amount;
        if (frequency.toUpperCase() === 'YEARLY') return amount / 12;
        return 0;
    };

    const totalMonthlyExpenses = expenses.reduce((acc, item) => {
        return acc + calculateMonthly(item.frequency, item.price);
    }, 0);

    const totalMonthlyIncome = incomes.reduce((acc, item) => {
        return acc + calculateMonthly(item.frequency, item.amount);
    }, 0);

    const monthlyRemaining = totalMonthlyIncome - totalMonthlyExpenses;

    // Derived values based on view
    const displayExpenses = view === 'monthly' ? totalMonthlyExpenses : totalMonthlyExpenses * 12;
    const displayIncome = view === 'monthly' ? totalMonthlyIncome : totalMonthlyIncome * 12;
    const displayRemaining = view === 'monthly' ? monthlyRemaining : monthlyRemaining * 12;

    return (
        <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">Budget Overview</h3>
                    <div className="bg-gray-100 p-0.5 rounded-lg flex">
                        <button
                            onClick={() => setView('monthly')}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${view === 'monthly'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setView('yearly')}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${view === 'yearly'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            Yearly
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                        <dt className="text-sm font-medium text-green-800 truncate">
                            Total Income
                        </dt>
                        <dd className="mt-1 text-2xl font-semibold text-green-900">
                            {formatCurrency(displayIncome)}
                        </dd>
                    </div>

                    <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                        <dt className="text-sm font-medium text-red-800 truncate">
                            Total Expenses
                        </dt>
                        <dd className="mt-1 text-2xl font-semibold text-red-900">
                            {formatCurrency(displayExpenses)}
                        </dd>
                    </div>

                    <div className={`rounded-lg p-4 border ${displayRemaining >= 0 ? 'bg-blue-50 border-blue-100' : 'bg-orange-50 border-orange-100'}`}>
                        <dt className={`text-sm font-medium truncate ${displayRemaining >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>
                            Remaining
                        </dt>
                        <dd className={`mt-1 text-2xl font-semibold ${displayRemaining >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>
                            {formatCurrency(displayRemaining)}
                        </dd>
                    </div>
                </div>
            </div>
        </div>
    );
}
