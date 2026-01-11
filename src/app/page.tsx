import Link from 'next/link';
import { getAllCategories } from '@/db/queries/categories';
import { Card, CardContent } from '@/components/ui/card';
import { ImageOff } from 'lucide-react';

export default async function HomePage() {
  const categories = await getAllCategories();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Categories</h1>

        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <ImageOff className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="mt-6 text-xl font-semibold">No categories yet</h3>
            <p className="mt-2 text-muted-foreground">
              Categories haven't been added yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {categories.map((category) => (
              <Link key={category.id} href={`/category/${category.slug}`}>
                <Card className="group cursor-pointer transition-all hover:scale-105 hover:shadow-lg overflow-hidden">
                  <div className="aspect-square w-full bg-muted">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
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
  );
}
