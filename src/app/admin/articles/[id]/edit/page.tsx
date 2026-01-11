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
import { ArrowLeft, Loader2, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Mark {
  id: number;
  name: string;
  slug: string;
  categoryId: number;
}

interface Variant {
  id?: number;
  name: string;
  price: string;
  stock: string;
  image: string;
}

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    markId: '',
  });
  const [variants, setVariants] = useState<Variant[]>([
    { name: '', price: '', stock: '0', image: '' },
  ]);

  useEffect(() => {
    Promise.all([fetchArticle(), fetchCategories()]);
  }, [id]);

  useEffect(() => {
    if (formData.categoryId) {
      fetchMarks(parseInt(formData.categoryId));
    }
  }, [formData.categoryId]);

  const fetchArticle = async () => {
    try {
      const res = await fetch(`/api/admin/articles/${id}`);
      if (res.ok) {
        const data = await res.json();
        setFormData({
          name: data.name || '',
          description: data.description || '',
          categoryId: data.categoryId?.toString() || '',
          markId: data.markId?.toString() || '',
        });
        if (data.variants && data.variants.length > 0) {
          setVariants(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data.variants.map((v: any) => ({
              id: v.id,
              name: v.name,
              price: v.price.toString(),
              stock: v.stock.toString(),
              image: v.image || '',
            }))
          );
        }
      } else {
        toast.error('Failed to load article');
        router.push('/admin/articles');
      }
    } catch (error) {
      toast.error('Failed to load article');
      router.push('/admin/articles');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      toast.error('Failed to load categories');
    }
  };

  const fetchMarks = async (categoryId: number) => {
    try {
      const res = await fetch(`/api/admin/marks?categoryId=${categoryId}`);
      const data = await res.json();
      setMarks(data);
    } catch (error) {
      toast.error('Failed to load marks');
    }
  };

  const addVariant = () => {
    setVariants([...variants, { name: '', price: '', stock: '0', image: '' }]);
  };

  const removeVariant = (index: number) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index));
    }
  };

  const updateVariant = (index: number, field: keyof Variant, value: string) => {
    const newVariants = [...variants];
    (newVariants[index] as any)[field] = value;
    setVariants(newVariants);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/articles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
          markId: formData.markId ? parseInt(formData.markId) : null,
        }),
      });

      if (res.ok) {
        toast.success('Article updated successfully');
        router.push('/admin/articles');
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to update article');
      }
    } catch (error) {
      toast.error('Failed to update article');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/articles">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Edit Article</h2>
          <p className="text-muted-foreground">Update article details</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Article Details</CardTitle>
          <CardDescription>Update the information for this article</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., iPhone 14 Screen"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value, markId: '' })}
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="mark">Mark (Optional)</Label>
              <Select
                value={formData.markId}
                onValueChange={(value) => setFormData({ ...formData, markId: value })}
                disabled={!formData.categoryId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={formData.categoryId ? "Select a mark" : "Select category first"} />
                </SelectTrigger>
                <SelectContent>
                  {marks.map((mark) => (
                    <SelectItem key={mark.id} value={mark.id.toString()}>
                      {mark.name}
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
                placeholder="A brief description of this article"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Link href="/admin/articles">
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

      <Card>
        <CardHeader>
          <CardTitle>Variants</CardTitle>
          <CardDescription>
            Manage variants for this article (Note: Variant editing not yet implemented)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {variants.length > 0 && variants[0].name ? (
            <div className="space-y-2">
              {variants.map((variant) => (
                <div key={variant.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <span className="font-medium">{variant.name}</span>
                    <span className="text-muted-foreground ml-2">
                      DH{variant.price} - Stock: {variant.stock}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No variants found.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
