import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await auth()

    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const income = await prisma.income.findUnique({
            where: {
                id: params.id,
                userId: session.user.id
            }
        })

        if (!income) {
            return new NextResponse("Not Found", { status: 404 })
        }

        return NextResponse.json(income)
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 })
    }
}
