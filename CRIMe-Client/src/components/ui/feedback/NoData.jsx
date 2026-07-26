import { Inbox } from "lucide-react";
import { cn } from "../../lib/utils";

const NoData = ({
    title = "No Data Found.",
    description = "There is currently nothing to display.",
    className = "",
}) => {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center gap-4 py-12 text-center",
                className
            )}
        >
            <Inbox className="h-12 w-12 text-muted-foreground" />

            <div>
                <h2 className="text-xl font-semibold">
                    {title}
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                    {description}
                </p>
            </div>
        </div>
    );
};

export default NoData;


{/* <NoData />


<NoData
    title="No Cases Found"
/>


<NoData
    title="No Notifications Found"
    description="There are currently no notifications."
/> */}