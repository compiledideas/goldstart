import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllMarks, getMarkBySlug } from '@/db/queries/marks';
import { getArticlesWithVariantsByMark } from '@/db/queries/articles';
import { getCategoryById } from '@/db/queries/categories';
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

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground">Categories</Link>
          {category && (
            <>
              <span> / </span>
              <Link href={`/category/${category.slug}`} className="hover:text-foreground">{category.name}</Link>
            </>
          )}
          <span> / </span>
          <span className="text-foreground">{mark.name}</span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight mb-8">{mark.name}</h1>

        {articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-muted-foreground">No items yet</p>
          </div>
        ) : (
          <div className="space-y-8">
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
          </div>
        )}
      </div>
    </div>
  );
}
