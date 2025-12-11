
import { PrismaClient } from '../lib/generated/client/index.js'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = 'test-' + Date.now() + '@example.com'
    const password = 'password123'
    const name = 'Test User'

    console.log(`Attempting to create user: ${email}`)

    try {
        const hashedPassword = await bcrypt.hash(password, 10)
        console.log('Password hashed successfully')

        const user = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
            },
        })
        console.log('User created successfully:', user.id)
    } catch (error) {
        console.error('Failed to create user:', error)
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
