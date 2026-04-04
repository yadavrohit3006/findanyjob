import { clsx } from "clsx";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "outline" | "source";
  className?: string;
}

const sourceColors: Record<string, string> = {
  linkedin: "bg-blue-100 text-blue-800 border-blue-200",
  naukri: "bg-orange-100 text-orange-800 border-orange-200",
  instahyre: "bg-purple-100 text-purple-800 border-purple-200",
  indeed: "bg-indigo-100 text-indigo-800 border-indigo-200",
  glassdoor: "bg-green-100 text-green-800 border-green-200",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
        variant === "default" && "bg-gray-100 text-gray-700 border-gray-200",
        variant === "outline" && "bg-white text-gray-600 border-gray-300",
        typeof children === "string" && variant === "source" && sourceColors[children.toLowerCase()],
        className
      )}
    >
      {children}
    </span>
  );
}
