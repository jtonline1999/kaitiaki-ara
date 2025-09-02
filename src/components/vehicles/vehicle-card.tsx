import type { Vehicle } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "../ui/button";
import Image from "next/image";

type VehicleCardProps = {
  vehicle: Vehicle;
};

export function VehicleCard({ vehicle }: VehicleCardProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md">
            <Image 
                src={vehicle.imageUrl}
                alt={`${vehicle.make} ${vehicle.model}`}
                fill
                className="object-cover"
                data-ai-hint="vehicle car"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
        </div>
        <CardTitle className="pt-4 font-headline">{vehicle.make} {vehicle.model}</CardTitle>
        <CardDescription>{vehicle.year}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Plate Number</span>
          <Badge variant="outline">{vehicle.plateNumber}</Badge>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/vehicles/${vehicle.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
