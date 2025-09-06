
'use client';

import type { ComplianceRecord } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, PlusCircle, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ComplianceForm } from "./compliance-form";
import { differenceInDays, format, parseISO } from "date-fns";
import { deleteComplianceRecord, getComplianceRecordsForVehicle } from "@/lib/compliance";
import { useEffect, useState, useTransition } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

export function ComplianceList({ vehicleId }: { vehicleId: string }) {
  const [records, setRecords] = useState<ComplianceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (user) {
      getComplianceRecordsForVehicle(user.uid, vehicleId).then((data) => {
        setRecords(data);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [user, vehicleId]);

  const handleDelete = async (recordId: string) => {
    startTransition(async () => {
      try {
        const idToken = await auth.currentUser?.getIdToken();
        if (!idToken) throw new Error("Authentication required.");

        await deleteComplianceRecord(idToken, recordId);
        toast({
          title: "Record Deleted",
          description: "The compliance record has been removed.",
        });
        // Optimistically remove from UI
        setRecords(prev => prev.filter(r => r.id !== recordId));
        router.refresh();
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Deletion Failed",
          description: error.message,
        });
      }
    });
  };

  const now = new Date();
  
  if (loading) {
      return <p>Loading compliance records...</p>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Compliance Records</CardTitle>
        <ComplianceForm mode="add" vehicleId={vehicleId}>
          <Button size="sm" className="gap-1">
            <PlusCircle className="h-4 w-4" />
            Add Record
          </Button>
        </ComplianceForm>
      </CardHeader>
      <CardContent>
        {records.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => {
                const expiryDate = parseISO(record.expiryDate);
                const daysUntilExpiry = differenceInDays(expiryDate, now);
                const isExpired = daysUntilExpiry < 0;
                const isExpiringSoon = daysUntilExpiry >= 0 && daysUntilExpiry <= 30;

                let statusVariant: "destructive" | "secondary" | "outline" = "outline";
                if (isExpired) statusVariant = "destructive";
                else if (isExpiringSoon) statusVariant = "secondary";
                
                let statusText = `Expires in ${daysUntilExpiry} days`;
                if(isExpired) statusText = `Expired ${Math.abs(daysUntilExpiry)} days ago`;
                if(daysUntilExpiry === 0) statusText = 'Expires today';

                return (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.type}</TableCell>
                    <TableCell>{format(expiryDate, "PPP")}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant}>{statusText}</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                           <ComplianceForm mode="edit" record={record} vehicleId={vehicleId}>
                              <button className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full">
                                Edit
                              </button>
                            </ComplianceForm>
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDelete(record.id)}
                            disabled={isPending}
                           >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                           </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="py-10 text-center text-sm text-muted-foreground">
            No compliance records found for this vehicle.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
