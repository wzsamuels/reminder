import { prisma } from "@/lib/prisma"
import { sendReminderEmail } from "@/lib/email"
import { NextRequest, NextResponse } from "next/server"

// Force dynamic to prevent caching of the cron route
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    // Simple protection with a secret (configure CRON_SECRET in Vercel/env)
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // Ideally enable this for prod. For dev we might skip or use a dev secret.
        if (process.env.NODE_ENV === 'production') {
            return new NextResponse('Unauthorized', { status: 401 });
        }
    }

    try {
        const subscriptions = await prisma.subscription.findMany({
            where: { isActive: true },
            include: { user: true }
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let emailsSent = 0;

        for (const sub of subscriptions) {
            if (!sub.user?.email) continue;

            const renewalDate = new Date(sub.nextRenewal);
            const reminderDate = new Date(renewalDate);
            reminderDate.setDate(renewalDate.getDate() - sub.reminderDays);

            // Check if today matches the calculated reminder date
            // We compare YYYY-MM-DD strings to ignore time
            const isReminderDay = reminderDate.toISOString().split('T')[0] === today.toISOString().split('T')[0];

            if (isReminderDay) {
                const sent = await sendReminderEmail(
                    sub.user.email,
                    sub.user.name || "User",
                    sub.name,
                    renewalDate.toDateString(),
                    `${sub.currency} ${sub.price}`
                );
                if (sent) emailsSent++;
            }
        }

        return NextResponse.json({ success: true, emailsSent });

    } catch (error) {
        console.error("Cron Error:", error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
