import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "TEACHER") {
        if (session?.user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }
    }

    const userId = session.user.id;
    const userRole = session.user.role;

    let classIds: string[] = [];

    try {
        if (userRole === "TEACHER") {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: { classes: true }
            });
            classIds = user?.classes.map(c => c.id) || [];
        } else {
            const classes = await prisma.class.findMany();
            classIds = classes.map(c => c.id);
        }

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

        const result = classesData.map(cls => {
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
    } catch (error: any) {
        console.error("Player Data API: Error", error);
        return new NextResponse("Internal Server Error: " + (error.message || String(error)), { status: 500 });
    }
}
