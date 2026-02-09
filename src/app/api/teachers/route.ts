import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const teachers = await prisma.user.findMany({
        where: { role: "TEACHER" },
        orderBy: { name: "asc" },
        include: {
            classes: {
                select: { id: true, name: true }
            }
        }
    });

    return NextResponse.json(teachers);
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, username, password, classIds } = body;

    if (!name || !username || !password) {
        return new NextResponse("Missing required fields", { status: 400 });
    }

    // Check if username exists
    const existing = await prisma.user.findUnique({
        where: { username },
    });

    if (existing) {
        return new NextResponse("Username already taken", { status: 400 });
    }

    const passwordHash = await hash(password, 12);

    try {
        const newTeacher = await prisma.user.create({
            data: {
                name,
                username,
                passwordHash,
                role: "TEACHER",
                classes: {
                    connect: classIds?.map((id: string) => ({ id })) || [],
                },
            },
            include: { classes: true }
        });
        return NextResponse.json(newTeacher);
    } catch (error) {
        return new NextResponse("Error creating teacher", { status: 500 });
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
        await prisma.user.delete({
            where: { id, role: "TEACHER" }, // Ensure we only delete TEACHERS, not admins accidentally
        });
        return new NextResponse("Teacher deleted");
    } catch (error) {
        return new NextResponse("Error deleting teacher", { status: 500 });
    }
}
export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { id, password, classIds } = body;

    if (!id) {
        return new NextResponse("Missing id", { status: 400 });
    }

    try {
        const data: any = {};
        if (password) {
            data.passwordHash = await hash(password, 12);
        }
        if (classIds) {
            data.classes = {
                set: classIds.map((cid: string) => ({ id: cid }))
            };
        }

        await prisma.user.update({
            where: { id, role: "TEACHER" },
            data,
        });
        return new NextResponse("Teacher updated");
    } catch (error) {
        return new NextResponse("Error updating teacher", { status: 500 });
    }
}
