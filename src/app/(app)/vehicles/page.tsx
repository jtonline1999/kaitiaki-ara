
'use client';

import { VehicleListHeader } from '@/components/vehicles/vehicle-list-header';
import { VehicleCard } from '@/components/vehicles/vehicle-card';
import { Suspense, useEffect, useState } from 'react';
import type { Vehicle } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { listVehicles } from '@/lib/repos/vehiclesRepo';

function VehicleGrid() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      listVehicles().then((data) => {
        setVehicles(data);
        setLoading(false);
      });
    } else {
        setLoading(false);
    }
  }, [user]);
  
  if (loading) {
      return <p>Loading vehicles...</p>;
  }

  if (vehicles.length === 0) {
    return (
       <div className="mt-8 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card p-12 text-center">
          <h3 className="text-xl font-semibold tracking-tight">No vehicles found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Get started by adding your first vehicle.
          </p>
        </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {vehicles.map((vehicle) => (
        <VehicleCard key={vehicle.id} vehicle={vehicle} />
      ))}
    </div>
  );
}


export default function VehiclesPage() {
  return (
    <div className="container mx-auto">
      <VehicleListHeader />
      <Suspense fallback={<p>Loading vehicles...</p>}>
        <VehicleGrid />
      </Suspense>
    </div>
  );
}
