import { getDictionary } from "@/app/[lang]/dictionaries";
import { DashboardLayoutClient } from "@/modules/dashboards/dashboard-layout-client";

export default async function DashboardLayout({
  params,
  children,
}: {
  params: { lang: "en" };
  children: React.ReactNode;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  
  return <DashboardLayoutClient dict={dict}>{children}</DashboardLayoutClient>;
}
