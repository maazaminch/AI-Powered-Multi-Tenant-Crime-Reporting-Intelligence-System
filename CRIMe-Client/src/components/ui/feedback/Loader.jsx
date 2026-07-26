import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

const sizes = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
};

const Loader = ({
    text = "Loading...",
    size = "md",
    fullScreen = false,
    className = "",
}) => {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center gap-3",
                fullScreen && "min-h-screen",
                className
            )}
        >
            <Loader2
                className={cn(
                    "animate-spin text-primary",
                    sizes[size]
                )}
            />

            {text && (
                <p className="text-sm text-muted-foreground">
                    {text}
                </p>
            )}
        </div>
    );
};

export default Loader;


// <Loader />

// <Loader text="Loading..." />

// <Loader size="sm" />

// <Loader size="lg" />

// <Loader fullScreen />

// <Loader
//     text="Loading Cases..."
//     fullScreen
// />

// <Loader className="" />