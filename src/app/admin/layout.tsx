import Link from "next/link";
import { logout } from "@/lib/actions-auth";
import { Button } from "@/components/ui/button";
import { LogOut, Home } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/40">
      <header className="border-b bg-background sticky top-0 z-10">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <h1 className="text-lg sm:text-xl font-bold font-headline">管理后台</h1>
            <div className="flex items-center gap-1 sm:gap-2">
              <Button variant="ghost" size="sm" asChild className="h-8 sm:h-9 px-2 sm:px-3">
                <Link href="/" className="flex items-center gap-1">
                  <Home className="h-4 w-4" />
                  <span className="hidden sm:inline">返回主页</span>
                </Link>
              </Button>
              <form action={logout}>
                <Button variant="outline" size="sm" className="h-8 sm:h-9 px-2 sm:px-3">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">退出登录</span>
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto p-3 sm:p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
