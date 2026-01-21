'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/ui/image-upload';

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function EditMarkPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    categoryId: '',
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    Promise.all([fetchMark(), fetchCategories()]);
  }, [id]);

  const fetchMark = async () => {
    try {
      const res = await fetch(`/api/admin/marks/${id}`);
      if (res.ok) {
        const data = await res.json();
        setFormData({
          name: data.name || '',
          description: data.description || '',
          image: data.image || '',
          categoryId: data.categoryId?.toString() || '',
        });
      } else {
        toast.error('Failed to load mark');
        router.push('/admin/marks');
      }
    } catch (_) {
      toast.error('Failed to load mark');
      router.push('/admin/marks');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      setCategories(data);
    } catch (_) {
      toast.error('Failed to load categories');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/marks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
        }),
      });

      if (res.ok) {
        toast.success('Mark updated successfully');
        router.push('/admin/marks');
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to update mark');
      }
    } catch (_) {
      toast.error('Failed to update mark');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/marks">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Edit Mark</h2>
          <p className="text-muted-foreground">Update mark details</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mark Details</CardTitle>
          <CardDescription>Update the information for this mark</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Apple"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="A brief description of this mark"
                rows={3}
              />
            </div>

            <ImageUpload
              value={formData.image}
              onChange={(url) => setFormData({ ...formData, image: url })}
            />

            <div className="flex justify-end gap-4">
              <Link href="/admin/marks">
                <Button type="button" variant="outline" disabled={saving}>
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={saving || !formData.categoryId}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
