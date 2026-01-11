'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { ImageUpload } from '@/components/ui/image-upload';

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
  name: string;
  price: string;
  stock: string;
  image: string;
}

export default function NewArticlePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
    fetchCategories();
  }, []);

  useEffect(() => {
    if (formData.categoryId) {
      fetchMarks(parseInt(formData.categoryId));
    } else {
      setMarks([]);
    }
  }, [formData.categoryId]);

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
    newVariants[index][field] = value;
    setVariants(newVariants);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate variants
    const validVariants = variants.filter((v) => v.name && v.price);
    if (validVariants.length === 0) {
      toast.error('Please add at least one variant with a name and price');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          categoryId: parseInt(formData.categoryId),
          markId: formData.markId ? parseInt(formData.markId) : null,
          variants: validVariants.map((v) => ({
            ...v,
            price: parseFloat(v.price),
            stock: parseInt(v.stock) || 0,
          })),
        }),
      });

      if (res.ok) {
        toast.success('Article created successfully');
        router.push('/admin/articles');
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to create article');
      }
    } catch (error) {
      toast.error('Failed to create article');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/articles">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">New Article</h2>
          <p className="text-muted-foreground">Create a new product or part</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Article Details</CardTitle>
          <CardDescription>Fill in the details for the new article</CardDescription>
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

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Variants *</Label>
                <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Variant
                </Button>
              </div>

              {variants.map((variant, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium">Variant {index + 1}</span>
                      {variants.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeVariant(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`variant-name-${index}`}>Name *</Label>
                        <Input
                          id={`variant-name-${index}`}
                          value={variant.name}
                          onChange={(e) => updateVariant(index, 'name', e.target.value)}
                          placeholder="e.g., Black, 128GB"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`variant-price-${index}`}>Price (€) *</Label>
                        <Input
                          id={`variant-price-${index}`}
                          type="number"
                          step="0.01"
                          value={variant.price}
                          onChange={(e) => updateVariant(index, 'price', e.target.value)}
                          placeholder="29.99"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`variant-stock-${index}`}>Stock</Label>
                        <Input
                          id={`variant-stock-${index}`}
                          type="number"
                          value={variant.stock}
                          onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div className="space-y-2">
                        <ImageUpload
                          value={variant.image}
                          onChange={(url) => updateVariant(index, 'image', url)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-end gap-4">
              <Link href="/admin/articles">
                <Button type="button" variant="outline" disabled={loading}>
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading || !formData.categoryId}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Article
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
