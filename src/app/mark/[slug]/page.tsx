import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllMarks, getMarkBySlug } from '@/db/queries/marks';
import { getArticlesWithVariantsByMark } from '@/db/queries/articles';
import { getCategoryById } from '@/db/queries/categories';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import Image from 'next/image';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export async function generateStaticParams() {
  const marks = await getAllMarks();
  return marks.map((mark) => ({
    slug: mark.slug,
  }));
}

export default async function MarkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const mark = await getMarkBySlug(slug);

  if (!mark) {
    notFound();
  }

  const articles = await getArticlesWithVariantsByMark(mark.id);
  const category = mark.categoryId ? await getCategoryById(mark.categoryId) : null;

  const whatsappNumber = "212600000000";

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto container">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground">Produits</Link>
          {category && (
            <>
              <span> / </span>
              <Link href={`/category/${category.slug}`} className="hover:text-foreground">{category.name}</Link>
            </>
          )}
        </div>

        <h1 className="text-3xl font-bold tracking-tight mb-6">{mark.name}</h1>

        {articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-muted-foreground">Aucun produit disponible</p>
          </div>
        ) : (
          <div className="border rounded-lg bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Produit</TableHead>
                  <TableHead>Variantes</TableHead>
                  <TableHead className="text-right">Prix</TableHead>
                  <TableHead className="text-center">Stock</TableHead>
                  <TableHead className="text-right">Commander</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articles.map((article) =>
                  article.variants.map((variant, idx) => (
                    <TableRow key={variant.id}>
                      {idx === 0 && (
                        <TableCell rowSpan={article.variants.length} className="align-top">
                          <div className="flex items-center gap-3">
                            {variant.image && (
                              <Image
                                src={variant.image}
                                alt={article.name}
                                width={50}
                                height={50}
                                className="w-12 h-12 object-cover rounded"
                              />
                            )}
                            <span className="font-medium">{article.name}</span>
                          </div>
                        </TableCell>
                      )}
                      <TableCell>{variant.name}</TableCell>
                      <TableCell className="text-right font-medium">
                        {variant.price > 0 ? `${variant.price} DH` : 'Sur demande'}
                      </TableCell>
                      <TableCell className="text-center">
                        {variant.stock > 0 ? (
                          <span className="text-green-600 text-sm">En stock</span>
                        ) : (
                          <span className="text-red-600 text-sm">Rupture</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right py-0">
                        <a
                          href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                            `Bonjour, je souhaite commander: ${article.name} - ${variant.name} (${variant.price > 0 ? variant.price + ' DH' : 'Prix sur demande'})`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Commander
                          </Button>
                        </a>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
