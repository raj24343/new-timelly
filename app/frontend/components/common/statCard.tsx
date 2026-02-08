import { ReactNode } from "react";

interface StatCardProps {
  icon?: ReactNode;
  iconClassName?: string;
  label?: string;
  title?: string;
  value: ReactNode;
  footer?: ReactNode;
  iconVariant?: "boxed" | "plain";
  className?: string;
  children?: ReactNode;
}

export default function StatCard({
  icon,
  iconClassName,
  label,
  title,
  value,
  footer,
  iconVariant = "boxed",
  className,
  children,
}: StatCardProps) {
  const heading = label ?? title ?? "";
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur ${className ?? ""}`}>
      <div className="flex items-center gap-3">
        {icon ? (
          <div
            className={
              iconVariant === "plain"
                ? `text-white/50 ${iconClassName ?? ""}`
                : `flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 ${iconClassName ?? "text-lime-300"}`
            }
          >
            {icon}
          </div>
        ) : null}
        <div>
          {heading ? (
            <div className="text-[11px] uppercase tracking-wide text-white/60">
              {heading}
            </div>
          ) : null}
          <div className="text-lg font-semibold text-white">{value}</div>
          {footer ? (
            <div className="text-xs text-white/50 mt-1">{footer}</div>
          ) : null}
        </div>
      </div>
      {children}
    </div>
  );
}
