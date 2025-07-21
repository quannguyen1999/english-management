import { ModeToggle } from "@/components/mode-toggle";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuSkeleton,
  SidebarProvider,
} from "@/components/ui/sidebar";

export default function Home() {
  return (
    <div className="flex h-screen">
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <h2 className="text-lg font-semibold">Dashboard</h2>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuButton>Home</SidebarMenuButton>
              <SidebarMenuButton>Settings</SidebarMenuButton>
              <SidebarMenuSkeleton showIcon />
              <SidebarMenuSkeleton />
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <div className="flex-1 p-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Welcome</h1>
            <ModeToggle />
          </div>
          <p className="text-muted-foreground">
            This page tests hydration fixes for mobile detection and theme
            switching.
          </p>
        </div>
      </SidebarProvider>
    </div>
  );
}
