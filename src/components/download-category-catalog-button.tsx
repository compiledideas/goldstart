'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';

interface DownloadCategoryCatalogButtonProps {
  categorySlug: string;
  categoryName: string;
}

export function DownloadCategoryCatalogButton({
  categorySlug,
  categoryName,
}: DownloadCategoryCatalogButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/catalog/category/${categorySlug}`);
      if (!response.ok) throw new Error('Failed to download catalog');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${categorySlug}-catalog-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (_) {
      console.error('Download error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={loading}
      variant="outline"
      size="sm"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Téléchargement...
        </>
      ) : (
        <>
          <FileDown className="h-4 w-4 mr-2" />
          Télécharger PDF
        </>
      )}
    </Button>
  );
}
