import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "TEACHER")) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const classes = await prisma.class.findMany({
        orderBy: { name: "asc" },
        include: {
            _count: {
                select: { teachers: true, songs: true }
            }
        }
    });

    return NextResponse.json(classes);
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
        const newClass = await prisma.class.create({
            data: { name },
        });
        return NextResponse.json(newClass);
    } catch (error) {
        return new NextResponse("Error creating class", { status: 500 });
    }
}
export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
        return new NextResponse("Missing id", { status: 400 });
    }

    try {
        const classItem = await prisma.class.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { teachers: true, songs: true }
                }
            }
        });

        if (!classItem) {
            return new NextResponse("Class not found", { status: 404 });
        }

        if (classItem._count.teachers > 0 || classItem._count.songs > 0) {
            return new NextResponse("Cannot delete class with linked teachers or songs", { status: 400 });
        }

        await prisma.class.delete({
            where: { id },
        });

        return new NextResponse("Class deleted");
    } catch (error) {
        return new NextResponse("Error deleting class", { status: 500 });
    }
}
