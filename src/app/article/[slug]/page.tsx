import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getArticleWithVariants } from '@/lib/queries/articles';
import { getCategoryById } from '@/lib/queries/categories';
import { getMarkById } from '@/lib/queries/marks';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, ImageOff, Package, Check, X, Euro } from 'lucide-react';
import Image from 'next/image';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const data = await getArticleWithVariants(params.slug);

  if (!data) {
    notFound();
  }

  const category = await getCategoryById(data.categoryId as number);
  const mark = data.markId ? await getMarkById(data.markId) : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl hover:text-primary transition-colors">
           <Image alt='' src="/logo.png" className='h-24 '  />
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Home
            </Link>
            <Link href="/admin" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Admin
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b bg-gradient-to-b from-muted/30 to-background">
        <div className="container py-12">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-8 flex-wrap">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-1">
                <ChevronLeft className="h-4 w-4" />
                Home
              </Button>
            </Link>
            {category && (
              <>
                <span className="text-muted-foreground">/</span>
                <Link href={`/category/${category.slug}`} className="text-sm font-medium text-muted-foreground hover:text-foreground">
                  {category.name}
                </Link>
              </>
            )}
            {mark && (
              <>
                <span className="text-muted-foreground">/</span>
                <Link href={`/mark/${mark.slug}`} className="text-sm font-medium text-muted-foreground hover:text-foreground">
                  {mark.name}
                </Link>
              </>
            )}
          </div>

          {/* Article Header */}
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4">
              <Package className="h-3.5 w-3.5" />
              Product
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
              {data.name}
            </h1>
            {data.description && (
              <p className="text-lg text-muted-foreground max-w-2xl">
                {data.description}
              </p>
            )}
            <div className="mt-6 flex flex-wrap gap-4">
              <Badge variant="secondary" className="text-sm px-3 py-1">
                {data.variants.length} {data.variants.length === 1 ? 'variant' : 'variants'}
              </Badge>
              {data.variants.filter((v) => v.stock > 0).length > 0 && (
                <Badge variant="default" className="text-sm px-3 py-1">
                  <Check className="h-3 w-3 mr-1" />
                  In stock
                </Badge>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Variants Section */}
      <section className="container py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Available Variants</h2>
            <p className="text-muted-foreground mt-1">Select your preferred option</p>
          </div>
        </div>

        {data.variants.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <Package className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="mt-6 text-xl font-semibold">No variants available</h3>
            <p className="mt-2 text-muted-foreground">
              This product has no variants yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.variants.map((variant) => (
              <Card key={variant.id} className="overflow-hidden border-2 hover:border-primary/50 transition-colors">
                <div className="relative aspect-square w-full overflow-hidden bg-muted">
                  {variant.image ? (
                    <img
                      src={variant.image}
                      alt={variant.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                      <ImageOff className="h-16 w-16 text-muted-foreground/30" />
                    </div>
                  )}
                  {variant.stock === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                      <Badge variant="destructive" className="text-sm px-3 py-1">
                        Out of Stock
                      </Badge>
                    </div>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-1">{variant.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1 text-base font-semibold text-foreground">
                    <Euro className="h-4 w-4" />
                    {(variant.price / 100).toFixed(2)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Availability</span>
                      {variant.stock > 0 ? (
                        <Badge variant="default" className="gap-1">
                          <Check className="h-3 w-3" />
                          {variant.stock} in stock
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="gap-1">
                          <X className="h-3 w-3" />
                          Out of stock
                        </Badge>
                      )}
                    </div>
                    <Button
                      className="w-full"
                      disabled={variant.stock === 0}
                    >
                      {variant.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/40 mt-12">
        <div className="container py-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <span className="font-semibold">Phone Repair Parts</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
