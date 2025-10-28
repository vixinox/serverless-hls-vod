import { HomeNavbar } from "@/modules/home/home-navbar";
import { HomeSidebar } from "@/modules/home/home-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/lib/auth";

export default async function HomeLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  return (
    <SidebarProvider defaultOpen={false}>
      <SessionProvider session={session}>
        <div className="w-full h-full">
          <HomeNavbar/>
          <div className="flex">
            <HomeSidebar/>
            <div className="flex-1">
              {children}
            </div>
          </div>
        </div>
      </SessionProvider>
    </SidebarProvider>
  );
}