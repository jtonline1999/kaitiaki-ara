
'use client';

import type { Vehicle } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ComplianceList } from '@/components/vehicles/compliance-list';
import { notFound, useParams, useRouter } from 'next/navigation';
import { AlertTriangle, Loader2, MoreVertical, Trash2, Truck } from 'lucide-react';
import { VehicleForm } from '@/components/vehicles/vehicle-form';
import { Suspense, useEffect, useState, useTransition } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getVehicle, deleteVehicle } from '@/lib/repos/vehiclesRepo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

function VehicleData() {
  const params = useParams();
  const vehicleId = params.id as string;
  const { user } = useAuth();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (user && vehicleId) {
      getVehicle(vehicleId).then(data => {
        setVehicle(data);
        setLoading(false);
      });
    } else if (!user) {
      setLoading(false);
    }
  }, [user, vehicleId]);

  const handleDelete = async () => {
    startTransition(async () => {
      try {
        await deleteVehicle(vehicleId);
        toast({
          title: 'Vehicle Deleted',
          description: 'The vehicle and its records have been removed.',
        });
        router.push('/vehicles');
        router.refresh();
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Deletion Failed',
          description: error.message,
        });
      }
    });
  }

  if (loading) {
      return <div>Loading vehicle...</div>;
  }
  
  if (!vehicle) {
    notFound();
  }

  return (
    <>
       <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">{vehicle.make} {vehicle.model}</h1>
          <p className="text-muted-foreground">{vehicle.plateNumber}</p>
        </div>
        <div className="flex items-center gap-2">
          <VehicleForm mode="edit" vehicle={vehicle}>
            <Button variant="outline">Edit Vehicle</Button>
          </VehicleForm>
          <AlertDialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Vehicle
                  </DropdownMenuItem>
                </AlertDialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                  Are you sure?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the vehicle <strong>{vehicle.make} {vehicle.model} ({vehicle.plateNumber})</strong> and all of its associated compliance records. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Yes, delete vehicle
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Vehicle Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div className="font-semibold text-muted-foreground">Make</div>
              <div>{vehicle.make}</div>
              <div className="font-semibold text-muted-foreground">Model</div>
              <div>{vehicle.model}</div>
              <div className="font-semibold text-muted-foreground">Year</div>
              <div>{vehicle.year}</div>
              <div className="font-semibold text-muted-foreground">Plate</div>
              <div>
                <Badge variant="outline">{vehicle.plateNumber}</Badge>
              </div>
              <div className="font-semibold text-muted-foreground">VIN</div>
              <div>{vehicle.vin}</div>
              <div className="font-semibold text-muted-foreground">Color</div>
              <div className="flex items-center gap-2">
                <span
                  className="h-4 w-4 rounded-full border"
                  style={{ backgroundColor: vehicle.color.toLowerCase() }}
                ></span>
                {vehicle.color}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Suspense fallback={<div>Loading compliance records...</div>}>
            <ComplianceList vehicleId={vehicleId} />
          </Suspense>
        </div>
      </div>
    </>
  )
}

export default function VehicleDetailPage() {
  return (
    <div className="container mx-auto">
      <VehicleData />
    </div>
  );
}
