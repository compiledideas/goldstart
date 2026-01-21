'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Article {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  categoryId: number;
  categoryName: string | null;
  categorySlug: string | null;
  markId: number | null;
  markName: string | null;
  markSlug: string | null;
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number | null; name: string }>({
    open: false,
    id: null,
    name: '',
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const res = await fetch('/api/admin/articles');
      const data = await res.json();
      setArticles(data);
    } catch (_) {
      toast.error('Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.id) return;

    try {
      const res = await fetch(`/api/admin/articles/${deleteDialog.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Article deleted successfully');
        setDeleteDialog({ open: false, id: null, name: '' });
        fetchArticles();
      } else {
        toast.error('Failed to delete article');
      }
    } catch (_) {
      toast.error('Failed to delete article');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Articles</h2>
          <p className="text-muted-foreground">Manage your products and parts</p>
        </div>
        <Link href="/admin/articles/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Article
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Articles</CardTitle>
          <CardDescription>
            {articles.length} {articles.length === 1 ? 'article' : 'articles'} in total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {articles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground">No articles yet. Create your first article.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Mark</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium">{article.name}</TableCell>
                    <TableCell>
                      {article.categoryName ? (
                        <Link
                          href={`/category/${article.categorySlug}`}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Badge variant="outline">{article.categoryName}</Badge>
                        </Link>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {article.markName ? (
                        <Link
                          href={`/mark/${article.markSlug}`}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Badge variant="secondary">{article.markName}</Badge>
                        </Link>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {article.description || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/articles/${article.id}/edit`}>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setDeleteDialog({ open: true, id: article.id, name: article.name })
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Article</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteDialog.name}&quot;? This will also delete all
              variants of this article.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, id: null, name: '' })}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
