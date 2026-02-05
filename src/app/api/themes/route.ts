import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TEACHER")) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const themes = await prisma.theme.findMany({
        orderBy: { name: "asc" },
        include: {
            _count: {
                select: { songs: true }
            }
        }
    });

    return NextResponse.json(themes);
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name } = body;

    if (!name) {
        return new NextResponse("Name is required", { status: 400 });
    }

    try {
        const newTheme = await prisma.theme.create({
            data: { name },
        });
        return NextResponse.json(newTheme);
    } catch (error) {
        return new NextResponse("Error creating theme", { status: 500 });
    }
}
