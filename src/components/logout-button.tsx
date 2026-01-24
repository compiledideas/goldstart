'use client';

import { signOut } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function LogoutButton() {
  const [isPending, setIsPending] = useState(false);
  const {push} = useRouter()

  const handleLogout = async () => {
    setIsPending(true);
    try {
      await signOut();
      push('/');
    } catch {
      push('/login');
    } finally {
      setIsPending(false);
    }
  };

  return (
      <Button
        variant="ghost"
        size="icon"
        type="submit"
        title="Sign out"
        onClick={handleLogout}
        disabled={isPending}
      >
        <LogOut className="h-4 w-4" />
      </Button>
  );
}
