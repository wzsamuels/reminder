'use client'

import { useActionState } from 'react'
import { updateIncome } from '@/lib/income-actions'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { Income } from '@/lib/generated/client'

export default function EditIncomePage({ params }: { params: Promise<{ id: string }> }) {
    const [income, setIncome] = useState<Income | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [incomeId, setIncomeId] = useState<string>('')
    const [state, action, isPending] = useActionState(updateIncome, undefined)
    const router = useRouter()

    useEffect(() => {
        params.then((p) => {
            setIncomeId(p.id)
            fetch(`/api/income/${p.id}`)
                .then(res => {
                    if (!res.ok) throw new Error('Failed to fetch')
                    return res.json()
                })
                .then(data => {
                    setIncome(data)
                    setLoading(false)
                })
                .catch(err => {
                    setError('Failed to load income')
                    setLoading(false)
                })
        })
    }, [params])

    if (loading) return <div className="p-4">Loading...</div>
    if (error) return <div className="p-4 text-red-500">{error}</div>
    if (!income) return <div className="p-4">Income not found</div>

    return (
        <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Edit Income Source</h3>

                <form action={action} className="mt-5 space-y-4">
                    <input type="hidden" name="id" value={incomeId} />

                    <div>
                        <label htmlFor="source" className="block text-sm font-medium text-gray-700">Source Name</label>
                        <input type="text" name="source" id="source" defaultValue={income.source} required className="text-gray-900 mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Salary, Side Project..." />
                    </div>

                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 sm:text-sm">$</span>
                            </div>
                            <input type="number" name="amount" id="amount" step="0.01" defaultValue={income.amount} required className="text-gray-900 focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md py-2" placeholder="0.00" />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="frequency" className="block text-sm font-medium text-gray-700">Frequency</label>
                        <select id="frequency" name="frequency" defaultValue={income.frequency} className="text-gray-900 mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                            <option value="MONTHLY">Monthly</option>
                            <option value="YEARLY">Yearly</option>
                        </select>
                    </div>

                    {state?.message && (
                        <div className="text-red-500 text-sm">{state.message}</div>
                    )}

                    <div className="pt-5 flex justify-end">
                        <button type="button" onClick={() => router.back()} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3">
                            Cancel
                        </button>
                        <button type="submit" disabled={isPending} className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                            {isPending ? 'Updating...' : 'Update'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
