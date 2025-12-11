import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { authConfig } from "@/auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    const user = await prisma.user.findUnique({ where: { email } });
                    if (!user) {
                        return null; // Return null to trigger CredentialsSignin error, but we want to distinguish.
                        // NextAuth v5 is a bit tricky with custom errors in credentials provider.
                        // Ideally we throw an error here, but it gets wrapped.
                        // Let's rely on returning null for now, BUT actually checking specific conditions 
                        // isn't fully supported to bubble up EASILY without custom error classes extended from CredentialsSignin
                        throw new Error("UserNotFound");
                    }
                    if (!user.password) {
                        throw new Error("UserNotFound"); // Treat no password (e.g. oauth user trying creds) as not found for now or valid logic
                    }

                    const passwordsMatch = await bcrypt.compare(password, user.password);

                    if (passwordsMatch) return user;

                    throw new Error("InvalidPassword");
                }

                return null;
            },
        }),
    ],
})
