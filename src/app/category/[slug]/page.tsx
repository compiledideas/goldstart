import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllCategories, getCategoryBySlug } from '@/db/queries/categories';
import { getMarksByCategory } from '@/db/queries/marks';
import { getArticlesWithVariantsByCategory } from '@/db/queries/articles';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ImageOff } from 'lucide-react';

export async function generateStaticParams() {
  const categories = await getAllCategories();
  return categories.map((category) => ({
    slug: category.slug,
  }));
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const marks = await getMarksByCategory(category.id);
  const articles = await getArticlesWithVariantsByCategory(category.id);
  const hasMarks = marks.length > 0;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumb */}
        <Link href="/" className="inline-block text-sm text-muted-foreground hover:text-foreground mb-6">
          ← Back to Categories
        </Link>

        <h1 className="text-3xl font-bold tracking-tight mb-8">{category.name}</h1>

        {hasMarks ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {marks.map((mark) => (
              <Link key={mark.id} href={`/mark/${mark.slug}`}>
                <Card className="group cursor-pointer transition-all hover:scale-105 hover:shadow-lg overflow-hidden">
                  <div className="aspect-square w-full bg-muted">
                    {mark.image ? (
                      <img
                        src={mark.image}
                        alt={mark.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted">
                        <ImageOff className="h-12 w-12 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <div className="p-3 text-center">
                    <h3 className="font-medium text-sm truncate">{mark.name}</h3>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {articles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-muted-foreground">No items yet</p>
              </div>
            ) : (
              <>
                {articles.map((article) => (
                  article.variants.length > 0 && (
                    <div key={article.id}>
                      <h2 className="text-xl font-semibold mb-4">{article.name}</h2>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Variant</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-center">Stock</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {article.variants.map((variant) => (
                            <TableRow key={variant.id}>
                              <TableCell>{variant.name}</TableCell>
                              <TableCell className="text-right">${(variant.price / 100).toFixed(2)}</TableCell>
                              <TableCell className="text-center">
                                <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                                  variant.stock > 10 ? 'bg-green-100 text-green-800' :
                                  variant.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {variant.stock > 10 ? 'In Stock' :
                                   variant.stock > 0 ? `Low (${variant.stock})` :
                                   'Out of Stock'}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
