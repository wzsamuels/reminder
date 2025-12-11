'use server'

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { signIn } from '@/lib/auth'
import { AuthError } from 'next-auth'

const RegisterSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(1),
})

export async function registerUser(prevState: string | undefined, formData: FormData) {
    try {
        const data = Object.fromEntries(formData.entries())
        const validated = RegisterSchema.parse(data)

        const existingUser = await prisma.user.findUnique({
            where: { email: validated.email },
        })

        if (existingUser) {
            return 'Email already in use.'
        }

        const hashedPassword = await bcrypt.hash(validated.password, 10)

        await prisma.user.create({
            data: {
                email: validated.email,
                name: validated.name,
                password: hashedPassword,
            },
        })

        // Auto sign in not easily possible with creds in server action without redirect, 
        // but we can just redirect to login or dashboard if we could sign them in.
        // simpler to redirect to login or returned success.
        return 'success'

    } catch (error) {
        console.error('Registration error:', error)
        if (error instanceof z.ZodError) {
            return 'Invalid fields'
        }
        if (error instanceof Error) {
            return error.message
        }
        return 'Something went wrong.'
    }
}

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn('credentials', formData, { redirectTo: '/dashboard' })
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.'
                default:
                    return 'Something went wrong.'
            }
        }
        throw error // Rethrow so Next.js redirects work
    }
}
