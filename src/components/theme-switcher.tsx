"use client"

import * as React from "react"
import { Loader2, Palette } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation";
import { saveSettings } from "@/lib/actions";
import { useTheme } from "next-themes";
import { THEME_MODES } from "@/lib/constants";

export function ThemeSwitcher({ settings, allowGlobalSave = false }: { settings?: any, allowGlobalSave?: boolean }) {
  const router = useRouter();
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState<string | null>(null);

  React.useEffect(() => {
    setMounted(true);
    // Sync initial theme from settings if they differ and we haven't set a local preference yet?
    // Actually next-themes handles local preference automatically. 
    // We only might want to sync if there is NO local preference, but next-themes does that with defaultTheme.
  }, []);

  const handleThemeModeChange = async (modeId: string) => {
    // 1. Client-side instant update (Local Storage)
    setTheme(modeId);

    // 2. If allowed, save as Global Default (Database)
    if (allowGlobalSave && settings) {
      setIsUpdating(modeId);
      try {
        await saveSettings({ ...settings, appearanceMode: modeId });
        router.refresh();
      } catch (e) {
        console.error(e);
      } finally {
        setIsUpdating(null);
      }
    }
  };

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled className="h-9 w-9 border border-white/5">
        <Loader2 className="h-[1rem] w-[1rem] animate-spin opacity-20" />
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all active:scale-95">
          <Palette className="h-[1.1rem] w-[1.1rem] text-primary" />
          <span className="sr-only">主题设置</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[240px] p-3 space-y-3 backdrop-blur-2xl bg-background/95 border-border/50 shadow-2xl rounded-2xl">
        <section>
          <DropdownMenuLabel className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-50 px-1 mb-2 flex items-center gap-2">
            <Palette className="h-3 w-3" />
            {allowGlobalSave ? "设置默认主题 (全局)" : "切换主题 (仅本地)"}
          </DropdownMenuLabel>
          <div className="space-y-1.5">
            {THEME_MODES.map((mode) => {
              // Determine active state:
              // If global save is allowed, we show what's in settings (DB).
              // If local only, we show what's in useTheme (Local).
              const isActive = allowGlobalSave
                ? settings?.appearanceMode === mode.id
                : theme === mode.id;

              return (
                <button
                  key={mode.id}
                  onClick={() => handleThemeModeChange(mode.id)}
                  disabled={!!isUpdating}
                  className={`w-full h-14 px-3 rounded-xl text-left flex items-center gap-3 transition-all cursor-pointer border ${isActive
                    ? 'bg-primary/10 border-primary/40 shadow-lg shadow-primary/5'
                    : 'hover:bg-muted/60 border-transparent hover:border-border/50'
                    }`}
                >
                  {isUpdating === mode.id ? (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  ) : (
                    <div className={`w-10 h-10 rounded-xl ${mode.color} flex items-center justify-center shadow-md`}>
                      <mode.icon className="h-5 w-5 text-white drop-shadow-sm" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-semibold ${isActive ? 'text-primary' : 'text-foreground'}`}>
                      {mode.name}
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate">
                      {mode.description}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </section>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
