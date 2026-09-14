'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { resetIntakeData } from '@/app/intake/actions';

/**
 * Clears every module back to unanswered — symmetric with "Load demo data".
 * Nothing is actually deleted (writes are append-only, see fact-store), but
 * it LOOKS like everything just vanished, so this asks first rather than
 * firing on one accidental click.
 */
export function ResetDataButton() {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!window.confirm('Reset all intake answers back to empty? Nothing is lost permanently — this is undoing to a fresh start, not deleting history.')) {
          return;
        }
        startTransition(async () => {
          await resetIntakeData();
          router.refresh();
        });
      }}
    >
      <RotateCcw className="h-3.5 w-3.5" />
      {pending ? 'Resetting...' : 'Reset'}
    </Button>
  );
}
