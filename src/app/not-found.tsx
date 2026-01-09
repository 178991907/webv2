import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <h1 className="text-8xl font-bold font-headline text-primary">404</h1>
      <h2 className="mt-4 text-3xl font-semibold">页面未找到</h2>
      <p className="mt-2 text-muted-foreground">抱歉，我们找不到您要查找的页面。</p>
      <Button asChild className="mt-6">
        <Link href="/">返回主页</Link>
      </Button>
    </div>
  )
}
