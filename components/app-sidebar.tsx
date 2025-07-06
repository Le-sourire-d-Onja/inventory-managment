"use client";

import {
  Building,
  ChevronDown,
  Gift,
  Inbox,
  LayoutDashboard,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
} from "./ui/sidebar";
import { Button } from "./ui/button";
import { usePathname, useRouter } from "next/navigation";
import { Collapsible } from "./ui/collapsible";
import {
  CollapsibleContent,
  CollapsibleTrigger,
} from "@radix-ui/react-collapsible";

export default function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <h1 className="scroll-m-20 text-xl font-extrabold tracking-tight text-balance">
          Le Sourire d'Onja
        </h1>
        <p className="text-muted-foreground text-sm"> Gestion logistique </p>
      </SidebarHeader>
      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col gap-2 w-full">
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
            <Button
              className="justify-start"
              onClick={() => router.push("/demands")}
              variant={pathname.includes("demands") ? "default" : "ghost"}
            >
              <Inbox /> Demandes
            </Button>
          </SidebarGroupContent>
        </SidebarGroup>
        <Collapsible defaultOpen className="group/collapsible">
          <SidebarGroup>
            <SidebarGroupLabel asChild>
              <CollapsibleTrigger>
                Administratif{" "}
                <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <CollapsibleContent>
                <Button
                  className="justify-start"
                  onClick={() => router.push("/associations")}
                  variant={
                    pathname.includes("associations") ? "default" : "ghost"
                  }
                >
                  <Building /> Associations
                </Button>
              </CollapsibleContent>
            </SidebarGroupContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>
    </Sidebar>
  );
}
