export const ANIMATION_PRESETS = {
    // Card Interactions
    hoverCard: "transition-all duration-200 ease-in-out hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/10",
    clickableCard: "cursor-pointer active:scale-[0.98] transition-all duration-200",

    // Button Interactions
    activeButton: "active:scale-95 transition-transform duration-75",

    // Glassmorphism (Premium Feel)
    glassPanel: "bg-background/80 backdrop-blur-md border border-white/20 shadow-xl",
    glassOverlay: "bg-black/20 backdrop-blur-sm",

    // Entry Animations (using tailwindcss-animate)
    fadeIn: "animate-in fade-in zoom-in-95 duration-300 ease-out",
    slideUp: "animate-in slide-in-from-bottom-4 fade-in duration-500 ease-out",
    staggerList: "animate-in slide-in-from-bottom-2 fade-in duration-300 ease-out fill-mode-backwards",

    // Layout Transitions
    layoutShift: "transition-[width,height,transform] duration-300 ease-in-out",
}
