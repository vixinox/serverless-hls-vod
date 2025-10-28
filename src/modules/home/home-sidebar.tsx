"use client"

import { Sidebar, SidebarContent, SidebarFooter, } from "@/components/ui/sidebar"
import {
  AlignStartVertical,
  BookCheck,
  Clapperboard,
  History,
  Home,
  Info,
  MessageSquareWarning,
  Settings,
  Smartphone,
} from "lucide-react"
import { Separator } from "@/components/ui/separator";
import { usePathname } from "next/navigation";
import { HomeSidebarGroup } from "@/components/home-sidebar-group";

const mainItems = [
  {
    title: "首页",
    url: "/",
    icon: Home,
  },
  {
    title: "Shorts",
    url: "#",
    icon: Smartphone,
  },
  {
    title: "订阅",
    url: "#",
    icon: BookCheck,
  },
]

const userItems = [
  {
    title: "历史记录",
    url: "#",
    icon: History,
  },
  {
    title: "播放列表",
    url: "#",
    icon: AlignStartVertical,
  },
  {
    title: "我的视频",
    url: "#",
    icon: Clapperboard,
  },
]

const optionItems = [
  {
    title: "设置",
    url: "#",
    icon: Settings,
  },
  {
    title: "帮助",
    url: "#",
    icon: Info,
  },
  {
    title: "反馈",
    url: "#",
    icon: MessageSquareWarning,
  },
]

export const HomeSidebar = ({ alwaysSheet = false }: { alwaysSheet?: boolean }) => {
  const pathname = usePathname()

  return (
    <Sidebar
      alwaysSheet={alwaysSheet}
      transitionNone
      collapsible="icon"
      className="transition-none fixed left-0 top-0 border-none overflow-hidden"
    >
      <SidebarContent className="mt-15 px-1 gap-0 bg-background">
        <HomeSidebarGroup
          items={mainItems}
          pathname={pathname}
          onItemClick={(item) => {
            console.log("Clicked:", item.title);
          }}
        />

        <div className="w-full items-center pl-3 pr-6 py-1">
          <Separator className="bg-foreground/20"/>
        </div>

        <HomeSidebarGroup
          items={userItems}
          onItemClick={(item) => {
            console.log("Clicked:", item.title);
          }}
        />

        <div className="w-full items-center pl-3 pr-6 py-1">
          <Separator className="bg-foreground/20"/>
        </div>

        <HomeSidebarGroup
          items={optionItems}
          onItemClick={(item) => {
            console.log("Clicked:", item.title);
          }}
        />
      </SidebarContent>
      <SidebarFooter/>
    </Sidebar>
  );
};