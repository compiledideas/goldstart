import Link from 'next/link';
import { getAllCategories } from '@/db/queries/categories';
import { getRecentArticlesWithVariants } from '@/db/queries/articles';
import { Button } from '@/components/ui/button';
import { Settings, ShoppingCart, MessageCircle, Package } from 'lucide-react';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ImageOff } from 'lucide-react';

export default async function HomePage() {
  const categories = await getAllCategories();
  const recentArticles = await getRecentArticlesWithVariants(15);

  // WhatsApp number - you can change this
  const whatsappNumber = "212600000000";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="container mx-auto border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-24 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl hover:text-primary transition-colors">
            <Image alt='' src="/logo.png" className='h-24' height={100} width={250} />
          </Link>
          <Link href="/login">
            <Button variant="outline" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Admin
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="py-8 container mx-auto px-4">
        {/* Categories Section */}
        <section className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight mb-8 text-center">Nos Produits</h1>

          {categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <ShoppingCart className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="mt-6 text-xl font-semibold">Aucune catégorie disponible</h3>
              <p className="mt-2 text-muted-foreground">
                Les catégories seront bientôt disponibles.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {categories.map((category) => (
                <Link key={category.id} href={`/category/${category.slug}`}>
                  <Card className="group cursor-pointer transition-all overflow-hidden p-0 rounded-lg shadow-none">
                    <div className="w-full bg-muted">
                      {category.image ? (
                        <Image
                          width={400}
                          height={400}
                          src={category.image}
                          alt={category.name}
                          className="w-full object-contain transition-transform duration-300 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted">
                          <Package className="h-12 w-12 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <div className="p-3 text-center">
                      <h3 className="font-medium text-sm truncate">{category.name}</h3>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Recent Items Section */}
        {recentArticles.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold tracking-tight mb-6">Nouveautés (15 derniers jours)</h2>

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
                  {recentArticles.map((article) =>
                    article.variants.map((variant, idx) => (
                      <TableRow key={variant.id} className='py-0'>
                        {idx === 0 && (
                          <TableCell rowSpan={article.variants.length} className="align-top py-2">
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
                              <div>
                                <span className="font-medium block">{article.name}</span>
                                {article.markName && (
                                  <span className="text-xs text-muted-foreground">{article.markName}</span>
                                )}
                              </div>
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
          </section>
        )}
      </div>
    </div>
  );
}
