import { getDictionary } from "@/app/[lang]/dictionaries";

export default async function DashboardPage({
  params,
}: {
  params: { lang: "en" };
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  return (
    <div className="flex-1 p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Welcome</h1>
      </div>
      <p className="text-muted-foreground">
        This page tests hydration fixes for mobile detection and theme
        switching.
      </p>
    </div>
  );
}
