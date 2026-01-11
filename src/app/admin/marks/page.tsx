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
import { Plus, Edit, Trash2, ImageOff } from 'lucide-react';
import { toast } from 'sonner';

interface Mark {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  categoryId: number;
  categoryName: string | null;
}

export default function MarksPage() {
  const [marks, setMarks] = useState<Mark[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: number | null; name: string }>({
    open: false,
    id: null,
    name: '',
  });

  useEffect(() => {
    fetchMarks();
  }, []);

  const fetchMarks = async () => {
    try {
      const res = await fetch('/api/admin/marks');
      const data = await res.json();
      setMarks(data);
    } catch (error) {
      toast.error('Failed to load marks');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.id) return;

    try {
      const res = await fetch(`/api/admin/marks/${deleteDialog.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Mark deleted successfully');
        setDeleteDialog({ open: false, id: null, name: '' });
        fetchMarks();
      } else {
        toast.error('Failed to delete mark');
      }
    } catch (error) {
      toast.error('Failed to delete mark');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Marks</h2>
          <p className="text-muted-foreground">Manage your brands and manufacturers</p>
        </div>
        <Link href="/admin/marks/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Mark
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Marks</CardTitle>
          <CardDescription>
            {marks.length} {marks.length === 1 ? 'mark' : 'marks'} in total
          </CardDescription>
        </CardHeader>
        <CardContent>
          {marks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground">No marks yet. Create your first mark.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {marks.map((mark) => (
                  <TableRow key={mark.id}>
                    <TableCell>
                      {mark.image ? (
                        <img
                          src={mark.image}
                          alt={mark.name}
                          className="h-12 w-12 rounded-md object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted">
                          <ImageOff className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{mark.name}</TableCell>
                    <TableCell>{mark.categoryName || '-'}</TableCell>
                    <TableCell className="text-muted-foreground">{mark.slug}</TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {mark.description || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/marks/${mark.id}/edit`}>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setDeleteDialog({ open: true, id: mark.id, name: mark.name })
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
            <DialogTitle>Delete Mark</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteDialog.name}&quot;? This will also delete all
              articles in this mark.
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
