import { ModeToggle } from "@/components/mode-toggle";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { FriendsListHeader } from "@/modules/dashboards/friends-list-header";
import { getDictionary } from "../dictionaries";

export default async function Home({ params }: { params: { lang: "en" } }) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  return (
    <div className="flex h-screen">
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <h2 className="text-lg font-semibold">{dict.dashboard.title}</h2>
          </SidebarHeader>
          <SidebarContent>
            <FriendsListHeader />
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
