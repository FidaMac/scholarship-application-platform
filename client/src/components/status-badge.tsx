import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusMap: Record<string, { color: string; label: string }> = {
    pending: {
      color: "bg-yellow-400 text-slate-900",
      label: "Pending",
    },
    reviewing: {
      color: "bg-indigo-600 text-white",
      label: "Under Review",
    },
    approved: {
      color: "bg-green-500 text-white",
      label: "Approved",
    },
    rejected: {
      color: "bg-red-500 text-white",
      label: "Rejected",
    },
  };

  const { color, label } = statusMap[status] || {
    color: "bg-gray-400",
    label: status,
  };

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
        color,
        className
      )}
    >
      {label}
    </span>
  );
}
