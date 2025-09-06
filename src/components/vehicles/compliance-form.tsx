
"use client";

import type { ComplianceRecord } from "@/lib/types";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, type ReactNode } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { OcrModal } from "./ocr-modal";
import { predictRucExpiry } from "@/ai/flows/predict-ruc-expiry";
import { useToast } from "@/hooks/use-toast";
import { createComplianceRecord, updateComplianceRecord } from "@/lib/repos/complianceRepo";
import { useRouter } from "next/navigation";
import { Timestamp } from "firebase/firestore";

type ComplianceFormProps = {
  mode: "add" | "edit";
  record?: ComplianceRecord;
  children: ReactNode;
  vehicleId: string;
};

export function ComplianceForm({ mode, record, children, vehicleId }: ComplianceFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState(record?.type || "");
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(
    record ? record.expiryDate.toDate() : undefined
  );
  const [predictedRucDate, setPredictedRucDate] = useState<string | null>(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handlePredictRuc = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const odometerReadingKm = Number(formData.get('odometerReadingKm'));
    const rucKmsRemaining = Number(formData.get('rucKmsRemaining'));
    const kmPerDay = Number(formData.get('kmPerDay'));

    if (!odometerReadingKm || !rucKmsRemaining) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please enter odometer reading and RUC KMs remaining.",
      });
      return;
    }

    setIsPredicting(true);
    setPredictedRucDate(null);
    try {
      const result = await predictRucExpiry({
        odometerReadingKm,
        rucKmsRemaining,
        kmPerDay: kmPerDay || 100,
      });
      setPredictedRucDate(result.predictedExpiryDate);
      toast({
        title: "Prediction Complete",
        description: `Predicted RUC expiry date is ${format(new Date(result.predictedExpiryDate), "PPP")}.`,
      });
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Prediction Failed",
        description: "Could not predict RUC expiry date. Please try again.",
      });
    } finally {
      setIsPredicting(false);
    }
  };

  const handleSave = async () => {
    if (!type || !expiryDate) {
      toast({
        variant: 'destructive',
        title: 'Missing fields',
        description: 'Please select a type and expiry date.',
      });
      return;
    }
    
    setIsSaving(true);

    try {
      const recordData: Partial<ComplianceRecord> = {
        type: type as ComplianceRecord['type'],
        expiryDate: Timestamp.fromDate(expiryDate),
        vehicleId: vehicleId,
      };

      if (predictedRucDate) {
        recordData.predictedExpiryDate = Timestamp.fromDate(new Date(predictedRucDate));
      } else if (mode === 'edit' && record?.predictedExpiryDate) {
        recordData.predictedExpiryDate = record.predictedExpiryDate;
      }

      if (mode === 'add') {
        await createComplianceRecord(recordData as any);
        toast({ title: 'Record Added', description: 'The new compliance record has been saved.' });
      } else if (record) {
        await updateComplianceRecord(record.id, recordData);
        toast({ title: 'Record Updated', description: 'The compliance record has been updated.' });
      }
      setOpen(false);
      router.refresh();
    } catch (error: any) {
       toast({
        variant: "destructive",
        title: "Save Failed",
        description: error.message || "Could not save the record. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  }


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add" : "Edit"} Compliance Record
          </DialogTitle>
          <DialogDescription>
            Fill in the details for the compliance record.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Type
            </Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="type" className="col-span-3">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="WOF">WOF</SelectItem>
                <SelectItem value="Registration">Registration</SelectItem>
                <SelectItem value="RUC">RUC</SelectItem>
                <SelectItem value="Insurance">Insurance</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="expiryDate" className="text-right">
              Expiry Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !expiryDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {expiryDate ? format(expiryDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={expiryDate}
                  onSelect={setExpiryDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {type === 'RUC' && (
            <form onSubmit={handlePredictRuc} className="col-span-4 mt-4 space-y-4 rounded-md border p-4">
              <h4 className="font-semibold text-sm">RUC Expiry Prediction</h4>
              <div className="grid gap-2">
                <Label htmlFor="odometerReadingKm">Current Odometer (km)</Label>
                <Input id="odometerReadingKm" name="odometerReadingKm" type="number" placeholder="e.g., 125000" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="rucKmsRemaining">RUC KMs Remaining</Label>
                <Input id="rucKmsRemaining" name="rucKmsRemaining" type="number" placeholder="e.g., 850" />
              </div>
               <div className="grid gap-2">
                <Label htmlFor="kmPerDay">Avg. KM Per Day (Optional)</Label>
                <Input id="kmPerDay" name="kmPerDay" type="number" placeholder="Default: 100" />
              </div>
               <Button type="submit" disabled={isPredicting}>
                {isPredicting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Predict Expiry Date
              </Button>
              {predictedRucDate && (
                <p className="text-sm text-foreground">
                  Predicted expiry:{" "}
                  <span className="font-semibold">{format(new Date(predictedRucDate), "PPP")}</span>
                </p>
              )}
            </form>
          )}

        </div>
        <DialogFooter className="sm:justify-between">
          <OcrModal onDataExtracted={(text) => console.log(text)} />
          <div className="flex gap-2">
            <DialogClose asChild>
                <Button type="button" variant="secondary">Cancel</Button>
            </DialogClose>
            <Button type="submit" onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
