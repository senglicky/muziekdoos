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
    const { title, url, themeId, classId, coverUrl } = body;

    if (!title || !url || !themeId || !classId) {
        return new NextResponse("Missing required fields", { status: 400 });
    }

    try {
        const newSong = await prisma.song.create({
            data: {
                title,
                url,
                coverUrl,
                themeId,
                classId,
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

    // Teachers see their own songs, or all if needed? 
    // Requirement doesn't specify strictly visibility, but usually dashboard shows own uploads.
    // Let's return songs uploaded by this user.

    const { searchParams } = new URL(req.url);
    const myUploadsOnly = searchParams.get('myUploads') === 'true';

    const whereClause = (session.user.role === 'TEACHER' || myUploadsOnly)
        ? { uploadedById: session.user.id }
        : {};

    const songs = await prisma.song.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        include: {
            theme: true,
            class: true
        }
    });

    return NextResponse.json(songs);
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

        // Only allow owner or admin to delete
        if (song.uploadedById !== session.user.id && session.user.role !== "ADMIN") {
            return new NextResponse("Forbidden", { status: 403 });
        }

        await prisma.song.delete({
            where: { id },
        });

        // Note: Supabase storage file cleanup could be added here if needed,
        // but for now we focus on database record removal.

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
    const { id, title, themeId, classId } = body;

    if (!id) {
        return new NextResponse("Missing id", { status: 400 });
    }

    try {
        const updatedSong = await prisma.song.update({
            where: { id },
            data: {
                title: title ?? undefined,
                themeId: themeId ?? undefined,
                classId: classId ?? undefined,
            },
        });
        return NextResponse.json(updatedSong);
    } catch (error) {
        console.error(error);
        return new NextResponse("Error updating song", { status: 500 });
    }
}
