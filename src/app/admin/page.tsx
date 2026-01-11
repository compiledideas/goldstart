import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderTree, Tag, Package, Plus, TrendingUp, Activity } from 'lucide-react';
import { getAllCategories } from '@/db/queries/categories';
import { getAllMarks } from '@/db/queries/marks';
import { getAllArticles } from '@/db/queries/articles';

export default async function AdminDashboard() {
  const categories = await getAllCategories();
  const marks = await getAllMarks();
  const articles = await getAllArticles();

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's an overview of your inventory.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-green-500" />
          <span className="text-sm text-muted-foreground">Live</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Card className="group hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Categories</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <FolderTree className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Product categories in store
            </p>
            <Link href="/admin/categories/new">
              <Button size="sm" variant="ghost" className="mt-4 gap-1 hover:bg-primary/10">
                <Plus className="h-3 w-3" />
                Add Category
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Marks</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Tag className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{marks.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Brands and manufacturers
            </p>
            <Link href="/admin/marks/new">
              <Button size="sm" variant="ghost" className="mt-4 gap-1 hover:bg-primary/10">
                <Plus className="h-3 w-3" />
                Add Mark
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Articles</CardTitle>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Package className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{articles.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Products and parts
            </p>
            <Link href="/admin/articles/new">
              <Button size="sm" variant="ghost" className="mt-4 gap-1 hover:bg-primary/10">
                <Plus className="h-3 w-3" />
                Add Article
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks to manage your inventory
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Link href="/admin/categories">
            <Button variant="outline" className="gap-2">
              <FolderTree className="h-4 w-4" />
              Manage Categories
            </Button>
          </Link>
          <Link href="/admin/marks">
            <Button variant="outline" className="gap-2">
              <Tag className="h-4 w-4" />
              Manage Marks
            </Button>
          </Link>
          <Link href="/admin/articles">
            <Button variant="outline" className="gap-2">
              <Package className="h-4 w-4" />
              Manage Articles
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Get Started Guide (shown when no data) */}
      {categories.length === 0 && marks.length === 0 && articles.length === 0 && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Getting Started
            </CardTitle>
            <CardDescription>
              Follow these steps to set up your inventory
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                1
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">Create Categories</h4>
                <p className="text-sm text-muted-foreground">
                  Add product categories like Screens, Batteries, etc.
                </p>
                <Link href="/admin/categories/new">
                  <Button size="sm" variant="link" className="px-0 mt-1">
                    Add first category →
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                2
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">Add Marks</h4>
                <p className="text-sm text-muted-foreground">
                  Create brands like Apple, Samsung, etc. linked to categories
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                3
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">Create Articles</h4>
                <p className="text-sm text-muted-foreground">
                  Add products with variants, prices, and stock
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
