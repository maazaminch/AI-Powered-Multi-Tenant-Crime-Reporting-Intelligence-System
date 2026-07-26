import { AlertTriangle } from "lucide-react";
import { Button } from "../Button";
import { cn } from "@/lib/utils";

const ErrorState = ({
    title = "Something went wrong.",
    description = "Please try again later.",
    retry,
    buttonText = "Retry",
    className = "",
}) => {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center gap-4 py-12 text-center",
                className
            )}
        >
            <AlertTriangle className="h-12 w-12 text-destructive" />

            <div>
                <h2 className="text-xl font-semibold">
                    {title}
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                    {description}
                </p>
            </div>

            {retry && (
                <Button onClick={retry}>
                    {buttonText}
                </Button>
            )}
        </div>
    );
};

export default ErrorState;



{/* <ErrorState />

<ErrorState
    title="Failed to load cases."
/>


<ErrorState
    title="Unauthorized."
    description="Please login again."
/>


<ErrorState
    retry={refetch}
/>


<ErrorState
    retry={refetch}
    buttonText="Try Again"
/> */}