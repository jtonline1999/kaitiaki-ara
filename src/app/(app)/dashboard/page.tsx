
'use client';

export const dynamic = 'force-dynamic'; // ← ADDED
export const revalidate = 0;             // ← ADDED

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarClock } from 'lucide-react';

import dynamic from 'next/dynamic'; // ← ADDED
const UpcomingEvents = dynamic(
  () =>
    import('@/components/dashboard/upcoming-events').then(
      (m) => m.UpcomingEvents
    ),
  {
    ssr: false, // ← ADDED: never run this on the server/prerender
    loading: () => <div>Loading events...</div>, // ← ADDED
  }
);

/*import { UpcomingEvents } from '@/components/dashboard/upcoming-events';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarClock } from 'lucide-react';
import { Suspense } from 'react';*/

export default function DashboardPage() {
  return (
    <div className="container mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-headline tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's a summary of your vehicle compliance status.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className='space-y-1.5'>
              <CardTitle>Upcoming Renewals</CardTitle>
              <CardDescription>
                Compliance events due in the next 30 days.
              </CardDescription>
            </div>
            <CalendarClock className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Loading events...</div>}>
              <UpcomingEvents />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
