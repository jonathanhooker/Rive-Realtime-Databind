// import { RealtimeCursors } from '@/components/realtime-cursors'
import { createClient } from '@/lib/supabase/client';
import { Suspense } from 'react';

export async function RiveStatePage() {
  const supabase = await createClient()
  const { data: riveState } = await supabase.from('rive-state').select().limit(1).single();

  return <pre>{JSON.stringify(riveState, null, 2)}</pre>;
}

export default function Display() {

  return (
    <Suspense>
      <RiveStatePage />
    </Suspense>
  );

}
