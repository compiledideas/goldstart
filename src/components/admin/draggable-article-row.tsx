import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

interface DraggableArticleRowProps {
  article: {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    categoryName: string | null;
    categorySlug: string | null;
    markName: string | null;
    markSlug: string | null;
  };
  onDelete: (id: number, name: string) => void;
}

export function DraggableArticleRow({ article, onDelete }: DraggableArticleRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: article.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell className="w-12">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-2 hover:bg-muted rounded"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      </TableCell>
      <TableCell className="font-medium">{article.name}</TableCell>
      <TableCell>
        {article.categoryName ? (
          <Link
            href={`/category/${article.categorySlug}`}
            className="text-muted-foreground hover:text-foreground"
          >
            <Badge variant="outline">{article.categoryName}</Badge>
          </Link>
        ) : (
          '-'
        )}
      </TableCell>
      <TableCell>
        {article.markName ? (
          <Link
            href={`/mark/${article.markSlug}`}
            className="text-muted-foreground hover:text-foreground"
          >
            <Badge variant="secondary">{article.markName}</Badge>
          </Link>
        ) : (
          '-'
        )}
      </TableCell>
      <TableCell className="max-w-xs truncate text-muted-foreground">
        {article.description || '-'}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Link href={`/admin/articles/${article.id}/edit`}>
            <Button variant="ghost" size="icon">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(article.id, article.name)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
