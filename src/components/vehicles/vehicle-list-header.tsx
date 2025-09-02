import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { VehicleForm } from './vehicle-form';

export function VehicleListHeader() {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">My Vehicles</h1>
        <p className="text-muted-foreground">
          Manage your fleet of vehicles and their compliance.
        </p>
      </div>
      <VehicleForm mode="add">
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Vehicle
        </Button>
      </VehicleForm>
    </div>
  );
}
