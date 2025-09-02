import { VehicleListHeader } from '@/components/vehicles/vehicle-list-header';
import { vehicles as allVehicles } from '@/lib/data';
import { VehicleCard } from '@/components/vehicles/vehicle-card';

export default function VehiclesPage() {
  const vehicles = allVehicles;

  return (
    <div className="container mx-auto">
      <VehicleListHeader />
      {vehicles.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      ) : (
        <div className="mt-8 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card p-12 text-center">
          <h3 className="text-xl font-semibold tracking-tight">No vehicles found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Get started by adding your first vehicle.
          </p>
        </div>
      )}
    </div>
  );
}
