
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { differenceInDays } from 'date-fns';
import { FileText, ShieldCheck, Truck, Shield } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { useAuth } from '@/hooks/use-auth';
import { listenToUpcomingComplianceRecords } from '@/lib/repos/complianceRepo';
import { useEffect, useState } from 'react';
import type { ComplianceRecord, Vehicle } from '@/lib/types';
import { listenToListVehicles } from '@/lib/repos/vehiclesRepo';

const iconMap = {
  Registration: <FileText className="h-4 w-4" />,
  WOF: <ShieldCheck className="h-4 w-4" />,
  RUC: <Truck className="h-4 w-4" />,
  Insurance: <Shield className="h-4 w-4" />,
};

type UpcomingEvent = ComplianceRecord & {
  vehicle?: Vehicle;
  daysUntilExpiry: number;
};

export function UpcomingEvents() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }
    if (!user) {
      setLoading(false);
      setEvents([]);
      return;
    }

    setLoading(true);

    let vehicleMap = new Map<string, Vehicle>();

    // Listen to vehicles to enrich the compliance records
    const unsubscribeVehicles = listenToListVehicles((userVehicles) => {
      vehicleMap = new Map(userVehicles.map(v => [v.id, v]));
      // We might already have events, so we need to update them with new vehicle info
      setEvents(prevEvents => enrichRecords(prevEvents, vehicleMap));
    });

    // Listen to upcoming compliance records
    const unsubscribeCompliance = listenToUpcomingComplianceRecords(30, (upcomingRecords) => {
      const enriched = enrichRecords(upcomingRecords, vehicleMap);
      setEvents(enriched);
      setLoading(false);
    });

    function enrichRecords(records: ComplianceRecord[], vehicles: Map<string, Vehicle>): UpcomingEvent[] {
      const now = new Date();
      const recordsWithVehicles = records.map((record) => {
        const expiryDate = record.expiryDate.toDate(); // Convert Timestamp to Date
        return {
          ...record,
          vehicle: vehicles.get(record.vehicleId),
          daysUntilExpiry: differenceInDays(expiryDate, now),
        };
      });
      return recordsWithVehicles.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
    }

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribeVehicles();
      unsubscribeCompliance();
    };
  }, [user, isAuthLoading]);

  if (loading) {
    return (
      <div className="py-10 text-center text-sm text-muted-foreground">
        Loading upcoming events...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-10 text-center text-sm text-muted-foreground">
        Please sign in to see upcoming events.
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-muted-foreground">
        No upcoming renewals in the next 30 days. You're all set!
      </div>
    );
  }

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vehicle</TableHead>
            <TableHead>Compliance</TableHead>
            <TableHead className="text-right">Expires In</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((record) => (
            <TableRow key={record.id}>
              <TableCell>
                <div className="font-medium">
                  {record.vehicle?.make} {record.vehicle?.model}
                </div>
                <div className="text-sm text-muted-foreground">
                  {record.vehicle?.plateNumber}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                   {iconMap[record.type as keyof typeof iconMap] || <FileText className="h-4 w-4" />}
                  <span>{record.type}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Badge
                  variant={record.daysUntilExpiry < 7 ? 'destructive' : 'secondary'}
                >
                  {record.daysUntilExpiry} days
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/vehicles/${record.vehicleId}`}>View Vehicle</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
