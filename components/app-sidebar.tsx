"use client";

import { Gift, LayoutDashboard } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
} from "./ui/sidebar";
import { Button } from "./ui/button";
import { usePathname, useRouter } from "next/navigation";

export default function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <h1 className="scroll-m-20 text-xl font-extrabold tracking-tight text-balance">
          Le Sourire d'Onja
        </h1>
        <p className="text-muted-foreground text-sm"> Gestion logistique </p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="gap-1.5">
          <Button
            className="justify-start"
            onClick={() => router.push("/dashboard")}
            variant={pathname.includes("dashboard") ? "default" : "ghost"}
          >
            <LayoutDashboard /> Dashboard
          </Button>
          <Button
            className="justify-start"
            onClick={() => router.push("/donations")}
            variant={pathname.includes("donations") ? "default" : "ghost"}
          >
            <Gift /> Donations
          </Button>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
