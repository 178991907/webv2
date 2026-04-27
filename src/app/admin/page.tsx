import { getCategories, getSettings } from "@/lib/data";
import { AdminDashboard } from "./components/admin-dashboard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

export default async function AdminPage() {
  // Check for DATABASE_URL environment variable
  if (!process.env.DATABASE_URL) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>配置错误</AlertTitle>
          <AlertDescription>
            未检测到数据库连接字符串。请在您的托管平台（如Vercel）中设置 `DATABASE_URL` 环境变量以启用后台管理功能。
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const settings = await getSettings();
  const categories = await getCategories();

  return (
    <div className={`flex-1 ${settings.theme} appearance-${settings.appearanceMode}`}>
      <AdminDashboard initialSettings={settings} initialCategories={categories} />
    </div>
  );
}
