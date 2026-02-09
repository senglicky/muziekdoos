import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { title, url, themeId, classIds, coverUrl } = body;

    if (!title || !url || !themeId || !classIds || !Array.isArray(classIds) || classIds.length === 0) {
        return new NextResponse("Missing required fields", { status: 400 });
    }

    try {
        const newSong = await prisma.song.create({
            data: {
                title,
                url,
                coverUrl,
                themeId,
                classes: {
                    connect: classIds.map((id: string) => ({ id }))
                },
                uploadedById: session.user.id,
            },
        });
        return NextResponse.json(newSong);
    } catch (error) {
        console.error(error);
        return new NextResponse("Error creating song record", { status: 500 });
    }
}

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const myUploadsOnly = searchParams.get('myUploads') === 'true';

    const whereClause = (session.user.role === 'TEACHER' || myUploadsOnly)
        ? { uploadedById: session.user.id }
        : {};

    try {
        const songs = await prisma.song.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
            include: {
                theme: true,
                classes: true
            }
        });
        return NextResponse.json(songs);
    } catch (error) {
        console.error(error);
        return new NextResponse("Error fetching songs", { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
        return new NextResponse("Missing id", { status: 400 });
    }

    try {
        const song = await prisma.song.findUnique({
            where: { id },
        });

        if (!song) {
            return new NextResponse("Song not found", { status: 404 });
        }

        if (song.uploadedById !== session.user.id && session.user.role !== "ADMIN") {
            return new NextResponse("Forbidden", { status: 403 });
        }

        await prisma.song.delete({
            where: { id },
        });

        return new NextResponse("Song deleted");
    } catch (error) {
        console.error(error);
        return new NextResponse("Error deleting song", { status: 500 });
    }
}

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { id, title, themeId, classIds } = body;

    if (!id) {
        return new NextResponse("Missing id", { status: 400 });
    }

    try {
        const updatedSong = await prisma.song.update({
            where: { id },
            data: {
                title: title ?? undefined,
                themeId: themeId ?? undefined,
                classes: classIds ? {
                    set: classIds.map((cid: string) => ({ id: cid }))
                } : undefined,
            },
        });
        return NextResponse.json(updatedSong);
    } catch (error) {
        console.error(error);
        return new NextResponse("Error updating song", { status: 500 });
    }
}
