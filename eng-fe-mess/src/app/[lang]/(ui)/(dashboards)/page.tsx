import { getDictionary } from "@/app/[lang]/dictionaries";
import { DashboardClientWrapper } from "@/modules/dashboards/dashboard-client-wrapper";

export default async function DashboardPage({
  params,
}: {
  params: { lang: "en" };
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  
  return <DashboardClientWrapper />;
}
