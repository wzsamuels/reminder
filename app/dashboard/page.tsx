
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"
import { format } from "date-fns"
import { deleteIncome } from "@/lib/income-actions"
import { deleteSubscription } from "@/lib/subscription-actions"
import type { Subscription, Income } from "@/lib/generated/client"

import { CostSummary } from "./cost-summary"

export default async function DashboardPage() {
    const session = await auth()

    if (!session?.user?.id) return null

    const expenses: Subscription[] = await prisma.subscription.findMany({
        where: { userId: session.user.id },
        orderBy: { nextRenewal: 'asc' }
    })

    const incomes: Income[] = await prisma.income.findMany({
        where: { userId: session.user.id },
        orderBy: { amount: 'desc' }
    })

    return (
        <div className="space-y-6">
            <CostSummary expenses={expenses} incomes={incomes} />

            <div className="grid gap-6 md:grid-cols-2">
                {/* Income Section */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Income Sources</h2>
                        <Link href="/dashboard/add-income" className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200">
                            Add Income
                        </Link>
                    </div>
                    {incomes.length === 0 ? (
                        <div className="text-center py-6 bg-white rounded-lg shadow">
                            <p className="text-gray-500 text-sm">No income sources added.</p>
                        </div>
                    ) : (
                        <div className="bg-white shadow overflow-hidden sm:rounded-md">
                            <ul role="list" className="divide-y divide-gray-200">
                                {incomes.map((inc) => (
                                    <li key={inc.id}>
                                        <div className="px-4 py-4 flex items-center justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-medium text-gray-900 truncate">{inc.source}</p>
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                        Income
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-sm text-gray-500">
                                                    {inc.frequency.toLowerCase()}
                                                </p>
                                            </div>
                                            <div className="ml-4 flex-shrink-0 flex flex-col items-end gap-2">
                                                <div className="flex items-center text-sm font-semibold text-green-600">
                                                    +${inc.amount.toFixed(2)}
                                                </div>
                                                <div className="flex gap-2">
                                                    <Link href={`/dashboard/edit-income/${inc.id}`} className="text-xs text-indigo-600 hover:text-indigo-900 border border-indigo-200 px-2 py-1 rounded">
                                                        Edit
                                                    </Link>
                                                    <form action={async () => {
                                                        'use server'
                                                        await deleteIncome(inc.id)
                                                    }}>
                                                        <button type="submit" className="text-xs text-red-600 hover:text-red-800 border border-red-200 px-2 py-1 rounded">
                                                            Delete
                                                        </button>
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Expenses Section */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Expenses</h2>
                        <Link href="/dashboard/new" className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200">
                            Add Expense
                        </Link>
                    </div>
                    {expenses.length === 0 ? (
                        <div className="text-center py-6 bg-white rounded-lg shadow">
                            <p className="text-gray-500 text-sm">No expenses tracked yet.</p>
                        </div>
                    ) : (
                        <div className="bg-white shadow overflow-hidden sm:rounded-md">
                            <ul role="list" className="divide-y divide-gray-200">
                                {expenses.map((sub) => (
                                    <li key={sub.id}>
                                        <div className="px-4 py-4 flex items-center justify-between">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-medium text-indigo-600 truncate">{sub.name}</p>
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${sub.type === 'SUBSCRIPTION' ? 'bg-blue-100 text-blue-800' :
                                                        sub.type === 'BILL' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-purple-100 text-purple-800'
                                                        }`}>
                                                        {sub.type === 'YEARLY_EXPENSE' ? 'Yearly' : sub.type === 'SUBSCRIPTION' ? 'Sub' : 'Bill'}
                                                    </span>
                                                </div>
                                                <p className="mt-1 flex items-center text-sm text-gray-500">
                                                    <span className="truncate">{formatCurrency(sub.price, sub.currency)} / {sub.frequency.toLowerCase()}</span>
                                                </p>
                                            </div>
                                            <div className="ml-4 flex-shrink-0 flex flex-col items-end gap-2">
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <span className={sub.nextRenewal < new Date() ? "text-red-500 font-bold" : ""}>
                                                        {sub.nextRenewal.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })}
                                                    </span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Link href={`/dashboard/edit/${sub.id}`} className="text-xs text-indigo-600 hover:text-indigo-900 border border-indigo-200 px-2 py-1 rounded">
                                                        Edit
                                                    </Link>
                                                    <form action={async () => {
                                                        'use server'
                                                        await deleteSubscription(sub.id)
                                                    }}>
                                                        <button type="submit" className="text-xs text-red-600 hover:text-red-800 border border-red-200 px-2 py-1 rounded">
                                                            Delete
                                                        </button>
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
