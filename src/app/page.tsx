import Link from 'next/link';
import { getAllArticlesWithVariantsGroupedByMark } from '@/db/queries/articles';
import { Button } from '@/components/ui/button';
import { Settings, ShoppingCart, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default async function HomePage() {
  const groupedArticles = await getAllArticlesWithVariantsGroupedByMark();

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
        <h1 className="text-3xl font-bold tracking-tight mb-8 text-center">Nos Produits</h1>

        {groupedArticles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <ShoppingCart className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="mt-6 text-xl font-semibold">Aucun produit disponible</h3>
            <p className="mt-2 text-muted-foreground">
              Les produits seront bientôt disponibles.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {groupedArticles.map((group) => (
              <div key={group.markSlug || 'no-mark'} className="space-y-4">
                {/* Mark Header */}
                {group.markName && (
                  <h2 className="text-xl font-bold text-primary">{group.markName}</h2>
                )}

                {/* Articles Table */}
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
                      {group.articles.map((article) => (
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
                            <TableCell className="text-right">
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
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
