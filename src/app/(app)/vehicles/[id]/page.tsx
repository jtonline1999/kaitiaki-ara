import type { Vehicle, ComplianceRecord } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ComplianceList } from '@/components/vehicles/compliance-list';
import { notFound } from 'next/navigation';
import { Truck } from 'lucide-react';
import { VehicleForm } from '@/components/vehicles/vehicle-form';
import { getVehicle } from '@/lib/vehicles';
import { getComplianceRecordsForVehicle } from '@/lib/compliance';
import { Suspense } from 'react';

async function VehicleData({ vehicleId }: { vehicleId: string }) {
  const vehicle = await getVehicle(vehicleId);
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
        <VehicleForm mode="edit" vehicle={vehicle}>
          <button className="text-sm font-medium text-primary hover:underline">Edit Vehicle</button>
        </VehicleForm>
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

export default function VehicleDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto">
      <Suspense fallback={<div>Loading vehicle...</div>}>
        <VehicleData vehicleId={params.id} />
      </Suspense>
    </div>
  );
}
