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
  ziprecruiter: "bg-teal-100 text-teal-800 border-teal-200",
  monster: "bg-red-100 text-red-800 border-red-200",
  ladders: "bg-yellow-100 text-yellow-800 border-yellow-200",
  builtin: "bg-cyan-100 text-cyan-800 border-cyan-200",
  other: "bg-gray-100 text-gray-600 border-gray-200",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
        variant === "default" && "bg-gray-100 text-gray-700 border-gray-200",
        variant === "outline" && "bg-white text-gray-600 border-gray-300",
        variant === "source" && (typeof children === "string"
          ? (sourceColors[children.toLowerCase()] ?? sourceColors.other)
          : sourceColors.other),
        className
      )}
    >
      {children}
    </span>
  );
}
