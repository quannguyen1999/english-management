import { getDictionary } from "@/app/[lang]/dictionaries";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
} from "@/components/ui/sidebar";
import FriendHeaderView from "@/modules/chats/friend-header-view";
import { FriendsListHeader } from "@/modules/dashboards/friends-list-header";

export default async function DashboardLayout({
  params,
  children,
}: {
  params: { lang: "en" };
  children: React.ReactNode;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  return (
    <div className="flex h-screen">
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <FriendHeaderView dict={dict} />
          </SidebarHeader>
          <SidebarContent>
            <FriendsListHeader />
          </SidebarContent>
        </Sidebar>

        {children}
      </SidebarProvider>
    </div>
  );
}
