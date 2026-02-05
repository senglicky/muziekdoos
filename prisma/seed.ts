import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const password = await hash('welkom123', 12)
    const admin = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            name: 'Beheerder',
            passwordHash: password,
            role: 'ADMIN',
        },
    })

    const teacher = await prisma.user.upsert({
        where: { username: 'ellen' },
        update: {},
        create: {
            username: 'ellen',
            name: 'Ellen J.',
            passwordHash: password,
            role: 'TEACHER',
        },
    })

    console.log({ admin, teacher })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
