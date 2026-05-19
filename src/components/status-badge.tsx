import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const map: Record<string, string> = {
  // good / running
  "Completed": "bg-[var(--color-success)] text-[var(--color-success-foreground)]",
  "Delivered": "bg-[var(--color-success)] text-[var(--color-success-foreground)]",
  "Received": "bg-[var(--color-success)] text-[var(--color-success-foreground)]",
  "Approved": "bg-[var(--color-success)] text-[var(--color-success-foreground)]",
  "Passed": "bg-[var(--color-success)] text-[var(--color-success-foreground)]",
  "Running": "bg-[var(--color-success)] text-[var(--color-success-foreground)]",
  "Normal": "bg-[var(--color-success)] text-[var(--color-success-foreground)]",
  "Confirmed": "bg-[var(--color-success)] text-[var(--color-success-foreground)]",
  // warning
  "In Progress": "bg-[var(--color-warning)] text-[var(--color-warning-foreground)]",
  "Pending": "bg-[var(--color-warning)] text-[var(--color-warning-foreground)]",
  "Pending Approval": "bg-[var(--color-warning)] text-[var(--color-warning-foreground)]",
  "Partially Received": "bg-[var(--color-warning)] text-[var(--color-warning-foreground)]",
  "Ordered": "bg-[var(--color-warning)] text-[var(--color-warning-foreground)]",
  "Partial": "bg-[var(--color-warning)] text-[var(--color-warning-foreground)]",
  "Needs Review": "bg-[var(--color-warning)] text-[var(--color-warning-foreground)]",
  "Idle": "bg-[var(--color-warning)] text-[var(--color-warning-foreground)]",
  "Under Maintenance": "bg-[var(--color-warning)] text-[var(--color-warning-foreground)]",
  "Low Stock": "bg-[var(--color-warning)] text-[var(--color-warning-foreground)]",
  "Scheduled": "bg-[var(--color-warning)] text-[var(--color-warning-foreground)]",
  "In Transit": "bg-[var(--color-warning)] text-[var(--color-warning-foreground)]",
  "Packed": "bg-[var(--color-warning)] text-[var(--color-warning-foreground)]",
  "Dispatched": "bg-[var(--color-warning)] text-[var(--color-warning-foreground)]",
  // bad
  "Scrapped": "bg-destructive text-destructive-foreground",
  "Failed": "bg-destructive text-destructive-foreground",
  "Down": "bg-destructive text-destructive-foreground",
  "Out of Stock": "bg-destructive text-destructive-foreground",
  "Issue": "bg-destructive text-destructive-foreground",
  "Returned": "bg-destructive text-destructive-foreground",
  // neutral
  "Planned": "bg-secondary text-secondary-foreground",
  "Draft": "bg-secondary text-secondary-foreground",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge className={cn("border-0 font-medium", map[status] ?? "bg-muted text-muted-foreground")}>
      {status}
    </Badge>
  );
}
