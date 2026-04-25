"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <main className="mx-auto grid max-w-[1400px] gap-4 p-4 md:grid-cols-[260px_1fr]">
      <Sidebar pathname={pathname} />
      <section className="space-y-4">{children}</section>
    </main>
  );
}
