"use client";

import type { Vehicle } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, type ReactNode } from "react";
import { OcrModal } from "./ocr-modal";
import { Loader2 } from "lucide-react";

type VehicleFormProps = {
  mode: "add" | "edit";
  vehicle?: Vehicle;
  children: ReactNode;
};

export function VehicleForm({ mode, vehicle, children }: VehicleFormProps) {
  const [open, setOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  
  // This would be a server action to call the getVehicleMetadata tool
  const fetchVehicleData = async () => {
    setIsFetching(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real app, you would populate form fields with this data
    const mockData = {
      make: "Toyota",
      model: "Corolla",
      year: 2021,
      color: "Silver",
      vin: "123ABC456DEF789"
    };
    console.log("Fetched data:", mockData);

    setIsFetching(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add" : "Edit"} Vehicle</DialogTitle>
          <DialogDescription>
            Enter your vehicle's details below. You can start with the plate number.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="plateNumber" className="text-right">
              Plate
            </Label>
            <Input
              id="plateNumber"
              defaultValue={vehicle?.plateNumber}
              className="col-span-3"
            />
          </div>
          <div className="col-start-2 col-span-3">
             <Button variant="outline" size="sm" onClick={fetchVehicleData} disabled={isFetching}>
                {isFetching && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Fetch Details from Plate
            </Button>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="make" className="text-right">
              Make
            </Label>
            <Input id="make" defaultValue={vehicle?.make} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="model" className="text-right">
              Model
            </Label>
            <Input id="model" defaultValue={vehicle?.model} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="year" className="text-right">
              Year
            </Label>
            <Input id="year" type="number" defaultValue={vehicle?.year} className="col-span-3" />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="vin" className="text-right">
              VIN
            </Label>
            <Input id="vin" defaultValue={vehicle?.vin} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="color" className="text-right">
              Color
            </Label>
            <Input id="color" defaultValue={vehicle?.color} className="col-span-3" />
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
          <OcrModal onDataExtracted={(text) => console.log(text)} />
          <div className="flex gap-2">
            <DialogClose asChild>
              <Button type="button" variant="secondary">Cancel</Button>
            </DialogClose>
            <Button type="submit" onClick={() => setOpen(false)}>Save</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
