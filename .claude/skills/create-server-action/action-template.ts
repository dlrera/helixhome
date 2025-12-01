"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Define the validation schema
const {{ ActionName }}Schema = z.object({
    // TODO: Add your fields here
    id: z.string().min(1),
})

export type {{ ActionName }}Input = z.infer < typeof {{ ActionName }}Schema >

export async function { { ActionName } } (input: {{ ActionName }}Input) {
    // 1. Authentication Check
    const session = await auth()
    if (!session?.user?.id) {
        return { error: "Unauthorized" }
    }

    // 2. Input Validation
    const result = {{ ActionName }
}Schema.safeParse(input)
if (!result.success) {
    return { error: "Invalid input", details: result.error.flatten() }
}

try {
    // 3. Database Operation
    // TODO: Implement your DB logic here. Keep it fast (<300ms).
    // const data = await db.model.update(...)

    // 4. Revalidation
    // revalidatePath("/dashboard/...")

    return { success: true }
} catch (error) {
    console.error("{{ActionName}} Error:", error)
    return { error: "Failed to perform action" }
}
}
