"use client"
import {SidebarTrigger,useSidebar} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export default function navbar(){
    const { isMobile } = useSidebar()

    return (
        <header className="flex h-16 bg-muted shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 rounded-xl" >
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className={cn(isMobile?"":"hidden")} />
          </div>
        </header>
    )

}