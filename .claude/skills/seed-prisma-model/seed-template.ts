import { PrismaClient } from "@prisma/client"
import { faker } from "@faker-js/faker"

const prisma = new PrismaClient()

export async function seed{ { ModelName } } (count: number = 10) {
    console.log(`Seeding ${count} {{ModelName}}s...`)

    // 1. Fetch dependencies (e.g., Users to attach to)
    const users = await prisma.user.findMany({ select: { id: true } })
    if (users.length === 0) {
        console.warn("No users found. Skipping {{ModelName}} seed.")
        return
    }

    const data = []

    for (let i = 0; i < count; i++) {
        data.push({
            // TODO: Map your fields here
            name: faker.commerce.productName(),
            createdAt: faker.date.past(),
            updatedAt: new Date(),
            userId: faker.helpers.arrayElement(users).id, // Randomly assign to a user
        })
    }

    // 2. Bulk Insert
    await prisma.{ { modelName } }.createMany({
        data,
    })

    console.log(`✅ Seeded ${count} {{ModelName}}s`)
}
