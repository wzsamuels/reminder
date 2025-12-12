'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const SubscriptionSchema = z.object({
    name: z.string().min(1, "Name is required"),
    price: z.coerce.number().min(0, "Price must be positive"),
    currency: z.string().default("USD"),
    frequency: z.enum(["MONTHLY", "YEARLY"]),
    type: z.enum(["SUBSCRIPTION", "BILL", "YEARLY_EXPENSE"]).default("SUBSCRIPTION"),
    startDate: z.string().transform((str) => new Date(str)),
    nextRenewal: z.string().transform((str) => new Date(str)),
    reminderDays: z.coerce.number().min(0).default(3),
    sendEmail: z.coerce.boolean().default(true),
})

export async function createSubscription(prevState: any, formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) {
        return { message: 'Unauthorized' }
    }

    try {
        const data = Object.fromEntries(formData.entries())
        // Checkboxes don't send anything if unchecked, but if checked send "on".
        // If we treat it as boolean here via coerce.
        // Wait, FormData for unchecked checkbox returns nothing.
        // We probably need to handle 'sendEmail' specifically if it's missing.
        // However, standard form submission keeps it missing.
        // Let's rely on standard practice: check existence or "on".

        const rawData = {
            ...data,
            sendEmail: formData.get('sendEmail') === 'on'
        }

        const validated = SubscriptionSchema.parse(rawData)

        await prisma.subscription.create({
            data: {
                userId: session.user.id,
                name: validated.name,
                price: validated.price,
                currency: validated.currency,
                frequency: validated.frequency,
                type: validated.type,
                startDate: validated.startDate,
                nextRenewal: validated.nextRenewal,
                reminderDays: validated.reminderDays,
                sendEmail: validated.sendEmail,
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

export async function updateSubscription(prevState: any, formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) {
        return { message: 'Unauthorized' }
    }

    const id = formData.get('id') as string
    if (!id) return { message: 'Missing ID' }

    try {
        const data = Object.fromEntries(formData.entries())

        const rawData = {
            ...data,
            sendEmail: formData.get('sendEmail') === 'on'
        }

        const validated = SubscriptionSchema.parse(rawData)

        // Ensure user owns the subscription before updating
        const existing = await prisma.subscription.findUnique({
            where: { id, userId: session.user.id }
        })

        if (!existing) return { message: 'Subscription not found' }

        await prisma.subscription.update({
            where: { id },
            data: {
                name: validated.name,
                price: validated.price,
                currency: validated.currency,
                frequency: validated.frequency,
                type: validated.type,
                startDate: validated.startDate,
                nextRenewal: validated.nextRenewal,
                reminderDays: validated.reminderDays,
                sendEmail: validated.sendEmail,
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

export async function deleteSubscription(id: string) {
    const session = await auth()
    if (!session?.user?.id) {
        throw new Error('Unauthorized')
    }

    await prisma.subscription.delete({
        where: {
            id,
            userId: session.user.id, // Ensure ownership
        },
    })

    revalidatePath('/dashboard')
}
