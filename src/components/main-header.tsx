import Link from "next/link";
import type { Settings } from "@/lib/types";
import Image from "next/image";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon } from "lucide-react";

export function MainHeader({ settings }: { settings: Settings }) {
  return (
    <header className="py-6 sm:py-8 md:py-12 text-center relative overflow-hidden">
      {/* Decorative background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-2 z-10">
        <ThemeSwitcher settings={settings} />
        <Button asChild variant="outline" size="sm" className="h-8 sm:h-9 backdrop-blur-sm bg-background/50 hover:bg-background/80 transition-all">
          <Link href="/admin" className="flex items-center gap-1">
            <SettingsIcon className="h-4 w-4" />
            <span className="hidden sm:inline">管理入口</span>
          </Link>
        </Button>
      </div>
      <div className="container mx-auto px-4 pt-8 sm:pt-4 relative z-10">
        <div className="flex justify-center items-center mb-4 sm:mb-6 h-[60px] sm:h-[80px] md:h-[100px]">
          {settings.logo && (
            <Image
              src={settings.logo}
              alt="Logo"
              width={600}
              height={200}
              sizes="100vw"
              className="theme-logo object-contain h-full w-auto drop-shadow-lg"
              priority
            />
          )}
        </div>
        <h1
          style={{
            fontFamily: "'Caveat', cursive",
            backgroundImage: "linear-gradient(to right, hsl(var(--brand-grad-1-start)), hsl(var(--brand-grad-1-mid)), hsl(var(--brand-grad-1-end)))"
          }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight bg-clip-text text-transparent animate-gradient drop-shadow-sm"
        >
          {settings.title}
        </h1>
        <p
          style={{
            backgroundImage: "linear-gradient(to right, hsl(var(--brand-grad-2-start)), hsl(var(--brand-grad-2-mid)), hsl(var(--brand-grad-2-end)))"
          }}
          className="mt-2 sm:mt-3 text-lg sm:text-xl md:text-2xl lg:text-4xl font-bold tracking-tight bg-clip-text text-transparent animate-gradient"
        >
          Welcome to All-Subject English Enlightenment
        </p>
        <p
          style={{
            backgroundImage: "linear-gradient(to right, hsl(var(--brand-grad-1-start)), hsl(var(--brand-grad-1-end)))"
          }}
          className="mt-2 sm:mt-4 text-sm sm:text-base md:text-xl lg:text-2xl max-w-2xl mx-auto bg-clip-text text-transparent animate-gradient px-4 opacity-80"
        >
          系统 (平台) 由英语全科启蒙团队独立开发完成
        </p>
      </div>
    </header>
  );
}
