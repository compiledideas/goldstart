import Link from 'next/link';
import { getAllCategories } from '@/db/queries/categories';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ImageOff,  Settings } from 'lucide-react';
import Image from 'next/image';

export default async function HomePage() {
  const categories = await getAllCategories();

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
      <div className="py-6 container mx-auto">
        <div className="">
          {categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <ImageOff className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="mt-6 text-xl font-semibold">No categories yet</h3>
              <p className="mt-2 text-muted-foreground">
                Categories haven't been added yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {categories.map((category) => (
                <Link key={category.id} href={`/category/${category.slug}`}>
                  <Card className="group cursor-pointer transition-all hover:scale-105 hover:shadow-lg overflow-hidden">
                    <div className="aspect-square w-full bg-muted">
                      {category.image ? (
                        <Image
                          src={category.image}
                          alt={category.name}
                          width={400}
                          height={400}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted">
                          <ImageOff className="h-12 w-12 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-3 text-center">
                      <h3 className="font-medium text-sm truncate">{category.name}</h3>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
