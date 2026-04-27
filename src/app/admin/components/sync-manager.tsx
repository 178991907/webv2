'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Download, Upload, Database, AlertTriangle, Loader2 } from 'lucide-react';
import { exportData, importData, syncFromRemoteDb, type ExportData } from '@/lib/actions-sync';

export function SyncManager() {
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [remoteDbUrl, setRemoteDbUrl] = useState('');
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    // 导出数据
    const handleExport = async () => {
        setIsExporting(true);
        try {
            const result = await exportData();
            if (result.error) {
                toast({ title: '导出失败', description: result.error, variant: 'destructive' });
                return;
            }

            // 下载 JSON 文件
            const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `navigation-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast({ title: '导出成功', description: '数据已下载到本地' });
        } catch (error) {
            toast({ title: '导出失败', description: String(error), variant: 'destructive' });
        } finally {
            setIsExporting(false);
        }
    };

    // 处理文件选择
    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsImporting(true);
        try {
            const text = await file.text();
            const data = JSON.parse(text) as ExportData;

            // 验证数据格式
            if (!data.version || !data.categories) {
                throw new Error('无效的数据格式');
            }

            const result = await importData(data);
            if (result.error) {
                toast({ title: '导入失败', description: result.error, variant: 'destructive' });
            } else {
                toast({ title: '导入成功', description: '数据已恢复，页面将刷新' });
                setTimeout(() => window.location.reload(), 1500);
            }
        } catch (error) {
            toast({ title: '导入失败', description: String(error), variant: 'destructive' });
        } finally {
            setIsImporting(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    // 远程数据库同步
    const handleRemoteSync = async () => {
        if (!remoteDbUrl.trim()) {
            toast({ title: '请输入数据库连接地址', variant: 'destructive' });
            return;
        }

        setIsSyncing(true);
        try {
            const result = await syncFromRemoteDb(remoteDbUrl);
            if (result.error) {
                toast({ title: '同步失败', description: result.error, variant: 'destructive' });
            } else {
                toast({ title: '同步成功', description: '数据已从远程数据库同步，页面将刷新' });
                setTimeout(() => window.location.reload(), 1500);
            }
        } catch (error) {
            toast({ title: '同步失败', description: String(error), variant: 'destructive' });
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* JSON 导入导出 */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Download className="h-5 w-5" />
                        本地数据备份
                    </CardTitle>
                    <CardDescription>
                        导出当前数据为 JSON 文件，或从 JSON 文件恢复数据
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            onClick={handleExport}
                            disabled={isExporting}
                            className="flex-1"
                        >
                            {isExporting ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> 导出中...</>
                            ) : (
                                <><Download className="mr-2 h-4 w-4" /> 导出数据</>
                            )}
                        </Button>

                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline" className="flex-1" disabled={isImporting}>
                                    {isImporting ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> 导入中...</>
                                    ) : (
                                        <><Upload className="mr-2 h-4 w-4" /> 导入数据</>
                                    )}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5 text-destructive" />
                                        确认导入数据？
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        此操作将<strong>清空现有所有数据</strong>，然后从文件恢复。建议先导出备份当前数据。
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>取消</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => fileInputRef.current?.click()}>
                                        选择文件并导入
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".json"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* 远程数据库同步 */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        远程数据库同步
                    </CardTitle>
                    <CardDescription>
                        从另一个 PostgreSQL 数据库同步数据
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="remote-db-url">数据库连接地址</Label>
                        <Input
                            id="remote-db-url"
                            placeholder="postgresql://user:password@host:5432/database"
                            value={remoteDbUrl}
                            onChange={(e) => setRemoteDbUrl(e.target.value)}
                            type="password"
                        />
                        <p className="text-xs text-muted-foreground">
                            格式：postgresql://用户名:密码@主机:端口/数据库名
                        </p>
                    </div>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="destructive"
                                disabled={isSyncing || !remoteDbUrl.trim()}
                                className="w-full"
                            >
                                {isSyncing ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> 同步中...</>
                                ) : (
                                    <><Database className="mr-2 h-4 w-4" /> 开始同步</>
                                )}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-destructive" />
                                    确认远程同步？
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    此操作将<strong>清空现有所有数据</strong>，然后从远程数据库同步。建议先导出备份当前数据。
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>取消</AlertDialogCancel>
                                <AlertDialogAction onClick={handleRemoteSync}>
                                    确认同步
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardContent>
            </Card>
        </div>
    );
}
