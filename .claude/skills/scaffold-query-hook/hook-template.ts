import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { {{ ServerAction }} } from "@/app/actions/{{ServerActionFile}}"

// Query Key Factory
export const {{ Feature }}Keys = {
    all: ["{{Feature}}"] as const,
    lists: () => [...{{ Feature }}Keys.all, "list"] as const,
        detail: (id: string) => [...{{ Feature }}Keys.all, "detail", id] as const,
}

// READ Hook
export function use{ { Feature } } s() {
    return useQuery({
        queryKey: {{ Feature }} Keys.lists(),
            queryFn: async () => {
                const result = await {{ ServerAction }
            }()
if (result.error) throw new Error(result.error)
return result.data
    },
staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// WRITE Hook
export function useUpdate{ { Feature } } () {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: {{ ServerAction }},
    onSuccess: () => {
        // Invalidate cache to trigger refetch
        queryClient.invalidateQueries({ queryKey: {{ Feature }}Keys.lists() })
    },
  })
}
