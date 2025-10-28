import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar"
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ElementType } from "react";

interface SidebarItem {
  title: string;
  url: string;
  icon: ElementType;
}

interface SidebarNavGroupProps {
  items: SidebarItem[];
  pathname?: string;
  onItemClick?: (item: SidebarItem) => void;
}

export function HomeSidebarGroup({ items, pathname, onItemClick }: SidebarNavGroupProps) {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:p-0.25">
      <SidebarGroupContent>
        <SidebarMenu className="gap-0">
          {items.map((item) => {
            const isActive = pathname === item.url;
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  asChild
                  isActive={isActive}
                  className={cn(
                    "h-10 hover:bg-foreground/20 group-data-[collapsible=icon]:flex-col " +
                    "group-data-[collapsible=icon]:h-18 group-data-[collapsible=icon]:gap-0",
                    isActive && "bg-foreground/10"
                  )}
                  onClick={() => onItemClick?.(item)}
                >
                  <Link
                    href={item.url}
                    className="flex items-center gap-4 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:justify-center"
                  >
                    <item.icon
                      className="size-6! ml-1 group-data-[collapsible=icon]:ml-0"
                      strokeWidth="1.5"
                    />
                    <span
                      className="font-medium ml-2 group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:text-[10px] group-data-[collapsible=icon]:mt-1.5">
                      {item.title}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}