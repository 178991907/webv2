"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Moon, Sun, Monitor, Palette, Check, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation";
import { saveSettings } from "@/lib/actions";

const THEMES = [
  { id: 'theme-blue', name: '蓝', color: 'bg-blue-500' },
  { id: 'theme-green', name: '绿', color: 'bg-emerald-500' },
  { id: 'theme-purple', name: '紫', color: 'bg-purple-500' },
  { id: 'theme-orange', name: '橙', color: 'bg-orange-500' },
  { id: 'theme-pink', name: '粉', color: 'bg-pink-500' },
  { id: 'theme-slate', name: '灰', color: 'bg-slate-500' },
];

const APPEARANCES = [
  { id: 'light', name: '标准模式', icon: Sun },
  { id: 'glass', name: '玻璃拟态', icon: Palette },
  { id: 'paper', name: '柔和纸张', icon: Monitor },
  { id: 'minimal', name: '极简专业', icon: Check },
];

export function ThemeSwitcher({ settings }: { settings?: any }) {
  const { setTheme, theme: currentMode } = useTheme()
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const [isUpdating, setIsUpdating] = React.useState<string | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleUpdateSetting = async (key: string, value: string) => {
    if (!settings) return;
    setIsUpdating(`${key}-${value}`);
    try {
      await saveSettings({ ...settings, [key]: value });
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(null);
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
          <span className="sr-only">视觉设置</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[220px] p-3 space-y-4 backdrop-blur-2xl bg-background/80 border-white/10 shadow-2xl rounded-2xl">
        <section>
          <DropdownMenuLabel className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-40 px-1 mb-2 flex items-center justify-between">
            显示模式
            {currentMode === 'dark' ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />}
          </DropdownMenuLabel>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'light', name: '亮色' },
              { id: 'dark', name: '暗色' },
              { id: 'system', name: '自动' }
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setTheme(m.id)}
                className={`h-8 rounded-lg text-[11px] font-semibold transition-all ${currentMode === m.id
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'hover:bg-muted text-muted-foreground'
                  }`}
              >
                {m.name}
              </button>
            ))}
          </div>
        </section>

        {settings && (
          <>
            <DropdownMenuSeparator className="opacity-5" />
            <section>
              <DropdownMenuLabel className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-40 px-1 mb-2 flex items-center justify-between">
                外观风格
                <Monitor className="h-3 w-3" />
              </DropdownMenuLabel>
              <div className="grid grid-cols-2 gap-1.5">
                {APPEARANCES.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => handleUpdateSetting('appearanceMode', a.id)}
                    disabled={!!isUpdating}
                    className={`h-9 px-3 rounded-lg text-[11px] font-semibold flex items-center gap-2 transition-all border ${settings.appearanceMode === a.id
                        ? 'bg-primary/10 text-primary border-primary/20'
                        : 'hover:bg-muted border-transparent text-muted-foreground'
                      }`}
                  >
                    {isUpdating === `appearanceMode-${a.id}` ? (
                      <Loader2 className="h-3 w-3 animate-spin mx-auto" />
                    ) : (
                      <>
                        <a.icon className="h-3 w-3 shrink-0 opacity-60" />
                        <span className="truncate">{a.name}</span>
                      </>
                    )}
                  </button>
                ))}
              </div>
            </section>

            <DropdownMenuSeparator className="opacity-5" />
            <section>
              <DropdownMenuLabel className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-40 px-1 mb-2 flex items-center justify-between">
                品牌配色
                <Check className="h-3 w-3" />
              </DropdownMenuLabel>
              <div className="grid grid-cols-6 gap-2 pt-1">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleUpdateSetting('theme', t.id)}
                    disabled={!!isUpdating}
                    className={`h-6 w-full rounded-full border-2 transition-all flex items-center justify-center ${settings.theme === t.id
                        ? 'border-primary scale-110 shadow-sm'
                        : 'border-transparent hover:scale-110 opacity-60 hover:opacity-100'
                      } ${t.color}`}
                    title={t.name}
                  >
                    {isUpdating === `theme-${t.id}` ? (
                      <Loader2 className="h-2 w-2 text-white animate-spin" />
                    ) : settings.theme === t.id && (
                      <Check className="h-2 w-2 text-white" />
                    )}
                  </button>
                ))}
              </div>
            </section>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
