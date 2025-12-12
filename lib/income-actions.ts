'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const IncomeSchema = z.object({
    amount: z.coerce.number().min(0, "Amount must be positive"),
    source: z.string().min(1, "Source is required"),
    frequency: z.enum(["MONTHLY", "YEARLY"]).default("MONTHLY"),
})

export async function createIncome(prevState: any, formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) {
        return { message: 'Unauthorized' }
    }

    try {
        const data = Object.fromEntries(formData.entries())
        const validated = IncomeSchema.parse(data)

        await prisma.income.create({
            data: {
                userId: session.user.id,
                amount: validated.amount,
                source: validated.source,
                frequency: validated.frequency,
            },
        })

    } catch (error) {
        if (error instanceof z.ZodError) {
            return { message: 'Invalid data', errors: error.flatten().fieldErrors }
        }
        return { message: 'Something went wrong' }
    }

    revalidatePath('/dashboard')
    redirect('/dashboard')
}

export async function updateIncome(prevState: any, formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) {
        return { message: 'Unauthorized' }
    }

    const id = formData.get('id') as string
    if (!id) return { message: 'Missing ID' }

    try {
        const data = Object.fromEntries(formData.entries())
        const validated = IncomeSchema.parse(data)

        // Ensure user owns the income before updating
        const existing = await prisma.income.findUnique({
            where: { id, userId: session.user.id }
        })

        if (!existing) return { message: 'Income not found' }

        await prisma.income.update({
            where: { id },
            data: {
                amount: validated.amount,
                source: validated.source,
                frequency: validated.frequency,
            },
        })

    } catch (error) {
        if (error instanceof z.ZodError) {
            return { message: 'Invalid data', errors: error.flatten().fieldErrors }
        }
        return { message: 'Something went wrong' }
    }

    revalidatePath('/dashboard')
    redirect('/dashboard')
}

export async function deleteIncome(id: string) {
    const session = await auth()
    if (!session?.user?.id) {
        throw new Error('Unauthorized')
    }

    await prisma.income.delete({
        where: {
            id,
            userId: session.user.id,
        },
    })

    revalidatePath('/dashboard')
}
