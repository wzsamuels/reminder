'use client'

import { useActionState } from 'react'
import { createSubscription } from '@/lib/subscription-actions'
import { useRouter } from 'next/navigation'

export default function NewSubscriptionPage() {
    const [state, action, isPending] = useActionState(createSubscription, undefined)
    const router = useRouter()

    return (
        <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Add a New Subscription</h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                    <p>Track your recurring payments and get notified before they renew.</p>
                </div>

                <form action={action} className="mt-5 space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Service Name</label>
                        <input type="text" name="name" id="name" required className="text-gray-900 mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Netflix, Spotify..." />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 sm:text-sm">$</span>
                                </div>
                                <input type="number" name="price" id="price" step="0.01" required className="text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md py-2" placeholder="0.00" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="currency" className="block text-sm font-medium text-gray-700">Currency</label>
                            <select id="currency" name="currency" className="text-gray-900 mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                <option>USD</option>
                                <option>EUR</option>
                                <option>GBP</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="frequency" className="block text-sm font-medium text-gray-700">Billing Frequency</label>
                        <select id="frequency" name="frequency" className="text-gray-900 mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                            <option value="MONTHLY">Monthly</option>
                            <option value="YEARLY">Yearly</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
                            <input type="date" name="startDate" id="startDate" required className="text-gray-900 mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                        <div>
                            <label htmlFor="nextRenewal" className="block text-sm font-medium text-gray-700">Next Renewal</label>
                            <input type="date" name="nextRenewal" id="nextRenewal" required className="text-gray-900 mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="reminderDays" className="block text-sm font-medium text-gray-700">Remind Me</label>
                        <div className="mt-1 flex items-center">
                            <input type="number" name="reminderDays" id="reminderDays" defaultValue={3} min={0} className="text-gray-900 block w-20 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            <span className="ml-2 text-sm text-gray-500">days before renewal</span>
                        </div>
                    </div>

                    {state?.message && (
                        <div className="text-red-500 text-sm">{state.message}</div>
                    )}

                    <div className="pt-5 flex justify-end">
                        <button type="button" onClick={() => router.back()} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3">
                            Cancel
                        </button>
                        <button type="submit" disabled={isPending} className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                            {isPending ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
