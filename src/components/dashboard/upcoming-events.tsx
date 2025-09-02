import { complianceRecords, vehicles } from '@/lib/data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { differenceInDays, parseISO } from 'date-fns';
import { FileText, ShieldCheck, Truck, Shield } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';

const iconMap = {
  Registration: <FileText className="h-4 w-4" />,
  WOF: <ShieldCheck className="h-4 w-4" />,
  RUC: <Truck className="h-4 w-4" />,
  Insurance: <Shield className="h-4 w-4" />,
};

export function UpcomingEvents() {
  const now = new Date();
  const upcomingRecords = complianceRecords
    .map(record => ({
      ...record,
      vehicle: vehicles.find(v => v.id === record.vehicleId),
      daysUntilExpiry: differenceInDays(parseISO(record.expiryDate), now),
    }))
    .filter(record => record.daysUntilExpiry >= 0 && record.daysUntilExpiry <= 30)
    .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);

  if (upcomingRecords.length === 0) {
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
          {upcomingRecords.map((record) => (
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
