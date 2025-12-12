
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { format } from "date-fns"
import { deleteSubscription } from "@/lib/subscription-actions"
import type { Subscription } from "@/lib/generated/client"

import { CostSummary } from "./cost-summary"

export default async function DashboardPage() {
    const session = await auth()

    if (!session?.user?.id) return null

    const subscriptions: Subscription[] = await prisma.subscription.findMany({
        where: { userId: session.user.id },
        orderBy: { nextRenewal: 'asc' }
    })

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Your Subscriptions</h1>
                <Link href="/dashboard/new" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                    Add Subscription
                </Link>
            </div>

            <CostSummary subscriptions={subscriptions} />

            {subscriptions.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-lg shadow">
                    <p className="text-gray-500">You don't have any subscriptions tracked yet.</p>
                    <div className="mt-4">
                        <Link href="/dashboard/new" className="text-indigo-600 hover:text-indigo-500 font-medium">Add your first one</Link>
                    </div>
                </div>
            ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul role="list" className="divide-y divide-gray-200">
                        {subscriptions.map((sub) => (
                            <li key={sub.id}>
                                <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-indigo-600 truncate">{sub.name}</p>
                                        <p className="mt-1 flex items-center text-sm text-gray-500">
                                            <span className="truncate">{sub.currency} {sub.price.toFixed(2)} / {sub.frequency.toLowerCase()}</span>
                                        </p>
                                    </div>
                                    <div className="ml-4 flex-shrink-0 flex flex-col items-end gap-2">
                                        <div className="flex items-center text-sm text-gray-500">
                                            <span className={sub.nextRenewal < new Date() ? "text-red-500 font-bold" : ""}>
                                                Renews: {format(sub.nextRenewal, 'MMM d, yyyy')}
                                            </span>
                                        </div>
                                        <form action={async () => {
                                            'use server'
                                            await deleteSubscription(sub.id)
                                        }}>
                                            <button type="submit" className="text-xs text-red-600 hover:text-red-800">
                                                Delete
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}
