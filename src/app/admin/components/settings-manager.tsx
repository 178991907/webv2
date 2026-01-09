"use client";

import React, { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Settings } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { changePassword } from "@/lib/actions-auth";
import { saveSettings } from "@/lib/actions";
import { Download, Upload, Database, AlertTriangle, Loader2, Palette, Check, Monitor } from 'lucide-react';
import { exportData, importData, syncFromRemoteDb, type ExportData } from '@/lib/actions-sync';

const APPEARANCES = [
  { id: 'light', name: '系统亮色', color: 'bg-white border-gray-200' },
  { id: 'dark', name: '系统暗色', color: 'bg-gray-900 border-gray-800' },
  { id: 'glass', name: '玻璃拟态', color: 'bg-blue-200/50 backdrop-blur-md border-blue-300' },
  { id: 'paper', name: '柔和纸张', color: 'bg-[#f5f2e9] border-[#e0d9c0]' },
  { id: 'minimal', name: '极简专业', color: 'bg-white border-black' },
];

const THEMES = [
  { id: 'theme-blue', name: 'Modern Blue', color: 'bg-[#3b82f6]' },
  { id: 'theme-green', name: 'Emerald Green', color: 'bg-[#059669]' },
  { id: 'theme-purple', name: 'Midnight Purple', color: 'bg-[#8b5cf6]' },
  { id: 'theme-orange', name: 'Sunset Orange', color: 'bg-[#f59e0b]' },
  { id: 'theme-pink', name: 'Rose Pink', color: 'bg-[#ec4899]' },
  { id: 'theme-slate', name: 'Slate Tech', color: 'bg-[#475569]' },
];

function SubmitButton({ isPending, text, pendingText }: { isPending: boolean, text: string, pendingText: string }) {
  return (
    <Button type="submit" disabled={isPending}>
      {isPending ? pendingText : text}
    </Button>
  );
}

export function SettingsManager({ initialSettings }: { initialSettings: Settings }) {
  const router = useRouter();
  const { toast } = useToast();
  const [settings, setSettings] = useState(initialSettings);
  const [isSettingsPending, startSettingsTransition] = useTransition();
  const [isPasswordPending, startPasswordTransition] = useTransition();

  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  const handlePasswordSubmit = async (formData: FormData) => {
    startPasswordTransition(async () => {
      const result = await changePassword(formData);
      if (result?.message) {
        toast({
          title: result.type === 'success' ? "成功" : "错误",
          description: result.message,
          variant: result.type === 'error' ? "destructive" : "default",
        });
        if (result.type === 'success') {
          (document.getElementById('password-form') as HTMLFormElement)?.reset();
        }
      }
    });
  };

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    startSettingsTransition(async () => {
      const result = await saveSettings(settings);
      if (result?.error) {
        toast({ title: "错误", description: `保存失败: ${result.error}`, variant: "destructive" });
      } else {
        toast({ title: "成功", description: "网站设置已成功保存！" });
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>网站设置</CardTitle>
          <CardDescription>管理网站的基本信息和功能。</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">网站标题</Label>
              <Input id="title" name="title" value={settings.title} onChange={handleSettingsChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo">Logo 图片地址</Label>
              <Input id="logo" name="logo" value={settings.logo} onChange={handleSettingsChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="copyright">版权信息</Label>
              <Input id="copyright" name="copyright" value={settings.copyright} onChange={handleSettingsChange} />
            </div>
            <div className="space-y-4">
              <Label className="flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                外观风格 (独立于配色)
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {APPEARANCES.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setSettings(prev => ({ ...prev, appearanceMode: a.id }))}
                    className={`group relative flex flex-col items-center gap-2 p-2.5 rounded-xl border-2 transition-all ${settings.appearanceMode === a.id
                      ? 'border-primary bg-primary/5'
                      : 'border-transparent hover:border-muted-foreground/20 bg-muted/30'
                      }`}
                  >
                    <div className={`h-10 w-full rounded-lg shadow-sm border ${a.color} flex items-center justify-center`}>
                      {settings.appearanceMode === a.id && <Check className="h-4 w-4 text-primary" />}
                    </div>
                    <span className="text-[10px] font-medium text-center leading-tight">{a.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Label className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                品牌主色
              </Label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSettings(prev => ({ ...prev, theme: t.id }))}
                    className={`group relative flex flex-col items-center gap-2 p-2 rounded-xl border-2 transition-all ${settings.theme === t.id
                      ? 'border-primary bg-primary/5'
                      : 'border-transparent hover:border-muted-foreground/20 bg-muted/30'
                      }`}
                  >
                    <div className={`h-8 w-8 rounded-full shadow-inner ${t.color} flex items-center justify-center`}>
                      {settings.theme === t.id && <Check className="h-4 w-4 text-white" />}
                    </div>
                    <span className="text-[10px] font-medium text-center leading-tight">{t.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <Label htmlFor="searchEnabled">启用搜索功能</Label>
                <p className="text-xs text-muted-foreground">在主页上显示搜索框。</p>
              </div>
              <Switch
                id="searchEnabled"
                name="searchEnabled"
                checked={settings.searchEnabled}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, searchEnabled: checked }))}
              />
            </div>
            <SubmitButton isPending={isSettingsPending} text="保存设置" pendingText="保存中..." />
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>修改密码</CardTitle>
          <CardDescription>定期更换密码以确保账户安全。</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="password-form" action={handlePasswordSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">当前密码</Label>
              <Input id="currentPassword" name="currentPassword" type="password" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">新密码</Label>
              <Input id="newPassword" name="newPassword" type="password" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">确认新密码</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" required />
            </div>
            <SubmitButton isPending={isPasswordPending} text="修改密码" pendingText="修改中..." />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
