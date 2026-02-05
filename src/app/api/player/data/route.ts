import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "TEACHER") {
        // Admins could also play maybe? Allowing TEACHER only for now as per folder.
        if (session?.user.role !== "ADMIN") return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;
    const userRole = session.user.role;

    // Find classes for this teacher (or all if Admin, though logic might differ)
    // If teacher, find classes linked to them.
    // Then for those classes, find Themes that have Songs linked to those classes.

    let classIds: string[] = [];

    if (userRole === "TEACHER") {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { classes: true }
        });
        classIds = user?.classes.map(c => c.id) || [];
    } else {
        // Admin sees all?
        const classes = await prisma.class.findMany();
        classIds = classes.map(c => c.id);
    }

    // Fetch Classes with Themes and Songs
    // Complex query: We want Classes -> Themes -> Songs (filtered by that class)

    // Actually, easiest is to fetch Classes, then for each Class fetch compatible Songs with their Themes.
    // But we want the structure: Class -> Themes -> Songs

    const classesData = await prisma.class.findMany({
        where: { id: { in: classIds } },
        select: {
            id: true,
            name: true,
            songs: {
                include: {
                    theme: true
                }
            }
        }
    });

    // Transform data to desired hierarchy: Class -> Theme -> Songs
    const result = classesData.map(cls => {
        // Group songs by theme
        const themesMap = new Map();

        cls.songs.forEach(song => {
            if (!themesMap.has(song.theme.id)) {
                themesMap.set(song.theme.id, {
                    id: song.theme.id,
                    name: song.theme.name,
                    songs: []
                });
            }
            themesMap.get(song.theme.id).songs.push({
                id: song.id,
                title: song.title,
                url: song.url,
                coverUrl: song.coverUrl
            });
        });

        return {
            id: cls.id,
            name: cls.name,
            themes: Array.from(themesMap.values())
        };
    });

    return NextResponse.json(result);
}
