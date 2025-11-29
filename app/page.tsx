'use client'
import { RealtimeCursors } from '@/components/realtime-cursors'

export default function Home() {

  return (
    <main className="min-h-screen flex flex-col items-center">
      This is a new page
      <RealtimeCursors roomName="macrodata_refinement_office" username="Mark Scout" />
    </main>
  );
}
