import Link from "next/link";
import type { Route } from "next";
import { BarChart3, Newspaper, Landmark, Cog, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Tổng quan", icon: BarChart3 },
  { href: "/news", label: "Tin tức", icon: Newspaper },
  { href: "/financials", label: "Tài chính", icon: Landmark },
  { href: "/analysis", label: "Phân tích", icon: Activity },
  { href: "/settings", label: "Cài đặt", icon: Cog },
];

export function Sidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="panel h-full min-h-[560px] w-full p-4 md:w-64">
      <div className="mb-6 px-2">
        <p className="text-xs uppercase tracking-[0.24em] text-terminal-dim">Trạm HPG</p>
        <h1 className="mt-2 font-[var(--font-grotesk)] text-xl font-semibold">Trung tâm Phân tích Thép</h1>
      </div>
      <nav className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href as Route}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition",
                active
                  ? "bg-terminal-positive/15 text-terminal-positive"
                  : "text-terminal-dim hover:bg-terminal-panelSoft hover:text-terminal-text",
              )}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
