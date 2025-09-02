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
import { useState, type ReactNode, useTransition } from "react";
import { OcrModal } from "./ocr-modal";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { addVehicle, updateVehicle } from "@/lib/vehicles";

type VehicleFormProps = {
  mode: "add" | "edit";
  vehicle?: Vehicle;
  children: ReactNode;
};

const formSchema = z.object({
  plateNumber: z.string().min(1, "Plate number is required"),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.coerce.number().min(1900, "Invalid year"),
  vin: z.string().optional(),
  color: z.string().optional(),
  imageUrl: z.string().url("Invalid URL").optional(),
});

export function VehicleForm({ mode, vehicle, children }: VehicleFormProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: vehicle
      ? { ...vehicle, vin: vehicle.vin ?? "", color: vehicle.color ?? "" }
      : {
          plateNumber: "",
          make: "",
          model: "",
          year: new Date().getFullYear(),
          vin: "",
          color: "",
          imageUrl: "https://picsum.photos/600/400"
        },
  });
  
  const fetchVehicleData = async () => {
    setIsFetching(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockData = {
      make: "Toyota",
      model: "Hilux",
      year: 2022,
      color: "Silver",
      vin: "123ABC456DEF789"
    };
    
    form.setValue("make", mockData.make);
    form.setValue("model", mockData.model);
    form.setValue("year", mockData.year);
    form.setValue("color", mockData.color);
    form.setValue("vin", mockData.vin);

    setIsFetching(false);
  }

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      try {
        const vehicleData = {
            ...values,
            vin: values.vin || "",
            color: values.color || "",
            imageUrl: values.imageUrl || 'https://picsum.photos/600/400'
        };

        if (mode === 'add') {
          await addVehicle(vehicleData);
          toast({ title: 'Vehicle Added', description: 'The new vehicle has been saved.' });
        } else if (vehicle) {
          await updateVehicle(vehicle.id, vehicleData);
          toast({ title: 'Vehicle Updated', description: 'The vehicle has been updated.' });
        }
        form.reset();
        setOpen(false);
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Save Failed",
          description: error.message || "Could not save vehicle. Please try again.",
        });
      }
    });
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="plateNumber"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Plate</FormLabel>
                  <FormControl className="col-span-3">
                    <Input {...field} />
                  </FormControl>
                  <FormMessage className="col-span-4" />
                </FormItem>
              )}
            />
            
            <div className="col-start-2 col-span-3">
              <Button type="button" variant="outline" size="sm" onClick={fetchVehicleData} disabled={isFetching}>
                  {isFetching && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Fetch Details from Plate
              </Button>
            </div>

            <FormField
              control={form.control}
              name="make"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Make</FormLabel>
                  <FormControl className="col-span-3">
                    <Input {...field} />
                  </FormControl>
                   <FormMessage className="col-span-3 col-start-2" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Model</FormLabel>
                  <FormControl className="col-span-3">
                    <Input {...field} />
                  </FormControl>
                   <FormMessage className="col-span-3 col-start-2" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Year</FormLabel>
                  <FormControl className="col-span-3">
                    <Input type="number" {...field} />
                  </FormControl>
                   <FormMessage className="col-span-3 col-start-2" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vin"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">VIN</FormLabel>
                  <FormControl className="col-span-3">
                    <Input {...field} />
                  </FormControl>
                   <FormMessage className="col-span-3 col-start-2" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Color</FormLabel>
                  <FormControl className="col-span-3">
                    <Input {...field} />
                  </FormControl>
                   <FormMessage className="col-span-3 col-start-2" />
                </FormItem>
              )}
            />
            
            <DialogFooter className="sm:justify-between pt-4">
              <OcrModal onDataExtracted={(text) => console.log(text)} />
              <div className="flex gap-2">
                <DialogClose asChild>
                  <Button type="button" variant="secondary">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
