import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "outline";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyanline disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" && "bg-cyanline text-slate-950 hover:bg-[#7ee4ff]",
        variant === "ghost" && "text-slate-100 hover:bg-white/10",
        variant === "outline" && "border border-white/15 bg-white/5 text-slate-100 hover:bg-white/10",
        className
      )}
      {...props}
    />
  );
}
