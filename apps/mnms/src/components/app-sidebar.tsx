"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Key,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar
} from "@/components/ui/sidebar"
import {
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { Network } from 'lucide-react';

// This is sample data.
const data = {
  projects: [
    {
      name: "Keys",
      url: "/keys",
      icon: Key,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isMobile } = useSidebar()

  return (
    <Sidebar collapsible="icon" {...props} variant="floating">
      <SidebarHeader >
        <div className="flex justify-between m-2">
          <Network className="h-5 w-5"/>
          <SidebarTrigger className="group-data-[collapsible=icon]:hidden transition-sidebar"/>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarTrigger className={cn(
          "group-data-[state=expanded]:hidden transition-sidebar",
          isMobile?"hidden":""
          )}
        />

        <NavUser  />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
