import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const {{ ComponentName }}Variants = cva(
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
                destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
                outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
                secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
                ghost: "hover:bg-accent hover:text-accent-foreground",
                link: "text-primary underline-offset-4 hover:underline",
                // HelixIntel Specific Variants
                premium: "bg-gradient-to-r from-[#216093] to-[#57949A] text-white shadow-md hover:opacity-90",
            },
            size: {
                default: "h-9 px-4 py-2",
                sm: "h-8 rounded-md px-3 text-xs",
                lg: "h-10 rounded-md px-8",
                icon: "h-9 w-9",
                // Mobile-first touch target optimization
                touch: "h-11 px-6 text-base",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface { { ComponentName } } Props
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps < typeof {{ ComponentName }}Variants > {
        asChild?: boolean
    }

const {{ ComponentName }} = React.forwardRef < HTMLButtonElement, {{ ComponentName }}Props > (
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        return (
            <div
                className={cn({{ ComponentName }} Variants({ variant, size, className }))
    }
        ref = { ref }
{...props }
      />
    )
  }
)
{ { ComponentName } }.displayName = "{{ComponentName}}"

export { { { ComponentName } }, { { ComponentName } } Variants }
