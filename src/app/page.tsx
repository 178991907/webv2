import { getCategories, getSettings } from "@/lib/data";
import { LinkGrid } from "@/components/link-grid";
import { MainHeader } from "@/components/main-header";
import { MainFooter } from "@/components/main-footer";

export default async function Home() {
  const settings = await getSettings();
  const categories = await getCategories();

  return (
    <div className={`flex flex-col flex-1 ${settings.theme} appearance-${settings.appearanceMode}`}>
      <MainHeader settings={settings} />
      <main className="flex-1 container mx-auto px-4 pb-12 md:pb-20">
        <LinkGrid categories={categories} />
      </main>
      <MainFooter settings={settings} />
    </div>
  );
}
