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
    startDate: z.string().transform((str) => new Date(str)),
    nextRenewal: z.string().transform((str) => new Date(str)),
    reminderDays: z.coerce.number().min(0).default(3),
})

export async function createSubscription(prevState: any, formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) {
        return { message: 'Unauthorized' }
    }

    try {
        const data = Object.fromEntries(formData.entries())
        const validated = SubscriptionSchema.parse(data)

        await prisma.subscription.create({
            data: {
                userId: session.user.id,
                name: validated.name,
                price: validated.price,
                currency: validated.currency,
                frequency: validated.frequency,
                startDate: validated.startDate,
                nextRenewal: validated.nextRenewal,
                reminderDays: validated.reminderDays,
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
