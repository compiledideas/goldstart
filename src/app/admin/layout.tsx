import { requireAdminOrRedirect } from '@/lib/auth-server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { LogoutButton } from '@/components/logout-button';
import { LayoutDashboard, FolderTree, Tag, Package, Wrench, Home, Users } from 'lucide-react';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication - redirects to /login if not authenticated
  const session = await requireAdminOrRedirect();

  // Render admin layout for authenticated users
  return (
      <div className="flex min-h-screen bg-muted/30">
        {/* Sidebar */}
        <aside className="sticky top-0 h-screen w-64 border-r bg-background shadow-lg">
          <div className="flex h-16 items-center border-b px-6">
            <Link href="/admin" className="flex items-center gap-2 font-bold text-lg">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Wrench className="h-4 w-4 text-primary-foreground" />
              </div>
              Admin Panel
            </Link>
          </div>

          <nav className="flex flex-col gap-1 p-4">
            <Link href="/admin">
              <Button variant="ghost" className="w-full justify-start gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Separator className="my-2" />
            <Link href="/admin/categories">
              <Button variant="ghost" className="w-full justify-start gap-2">
                <FolderTree className="h-4 w-4" />
                Categories
              </Button>
            </Link>
            <Link href="/admin/marks">
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Tag className="h-4 w-4" />
                Marks
              </Button>
            </Link>
            <Link href="/admin/articles">
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Package className="h-4 w-4" />
                Articles
              </Button>
            </Link>
            <Link href="/admin/users">
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Users className="h-4 w-4" />
                Users
              </Button>
            </Link>
            <Separator className="my-2" />
            <Link href="/">
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Home className="h-4 w-4" />
                View Site
              </Button>
            </Link>
          </nav>

          <div className="absolute bottom-0 left-0 right-0 border-t p-4 bg-background">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <p className="font-medium truncate">{session.user.name}</p>
                <p className="text-muted-foreground text-xs truncate">{session.user.email}</p>
              </div>
              <LogoutButton />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
            <div className="flex h-16 items-center justify-between px-8">
              <h1 className="text-lg font-semibold">Phone Repair Parts Admin</h1>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm text-muted-foreground">System Online</span>
              </div>
            </div>
          </header>
          <main className="p-8">
            {children}
          </main>
        </div>
      </div>
    );
}
