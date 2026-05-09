"use client";

import AppSidebar from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { MoonLoader } from "react-spinners";
import { Suspense } from "react";
import { usePathname } from "next/navigation";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = pathname?.startsWith("/auth");

  if (isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <Suspense fallback={<MoonLoader />}>
        <main className="flex flex-col gap-2 w-full p-8">
          <SidebarTrigger className="initial md:hidden" />
          {children}
        </main>
      </Suspense>
    </SidebarProvider>
  );
}
