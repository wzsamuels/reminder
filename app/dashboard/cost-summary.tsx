'use client';

import { useState } from 'react';
import type { Subscription } from '@/lib/generated/client';

interface CostSummaryProps {
    subscriptions: Subscription[];
}

export function CostSummary({ subscriptions }: CostSummaryProps) {
    const [view, setView] = useState<'monthly' | 'yearly'>('monthly');

    const totalCost = subscriptions.reduce((acc, sub) => {
        let monthlyCost = 0;
        if (sub.frequency.toUpperCase() === 'MONTHLY') {
            monthlyCost = sub.price;
        } else if (sub.frequency.toUpperCase() === 'YEARLY') {
            monthlyCost = sub.price / 12;
        }
        return acc + monthlyCost;
    }, 0);

    const displayCost = view === 'monthly' ? totalCost : totalCost * 12;

    return (
        <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="p-5">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <dt className="text-sm font-medium text-gray-500 truncate">
                            Total Recurring Cost
                        </dt>
                        <dd className="mt-1 text-3xl font-semibold text-gray-900">
                            ${displayCost.toFixed(2)}
                            <span className="text-sm font-normal text-gray-500 ml-2">
                                / {view}
                            </span>
                        </dd>
                    </div>
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
            </div>
        </div>
    );
}
