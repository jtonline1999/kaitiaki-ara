"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, type ChangeEvent } from "react";
import { FileScan, Loader2 } from "lucide-react";
import { extractDataFromComplianceDocument } from "@/ai/flows/extract-data-from-compliance-document";
import { useToast } from "@/hooks/use-toast";

type OcrModalProps = {
  onDataExtracted: (text: string) => void;
};

export function OcrModal({ onDataExtracted }: OcrModalProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [fileName, setFileName] = useState("");
  const { toast } = useToast();

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsLoading(true);
    setExtractedText("");

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUri = reader.result as string;
        try {
          const result = await extractDataFromComplianceDocument({ photoDataUri: dataUri });
          setExtractedText(result.extractedData);
          toast({
            title: "Extraction Successful",
            description: "Review the extracted text below.",
          });
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Extraction Failed",
            description: "Could not extract data from the document. Please try again.",
          });
          setExtractedText("Error: Could not extract data.");
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "File Read Error",
        description: "There was an error reading the file.",
      });
      setIsLoading(false);
    }
  };

  const handleUseData = () => {
    onDataExtracted(extractedText);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <FileScan className="h-4 w-4" />
          Scan Document
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan Compliance Document</DialogTitle>
          <DialogDescription>
            Upload a photo of a document to automatically extract information using OCR.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <Label htmlFor="document-upload">Upload Photo</Label>
          <Input id="document-upload" type="file" accept="image/*" onChange={handleFileChange} />
          {fileName && <p className="text-sm text-muted-foreground">Selected: {fileName}</p>}
        </div>

        {isLoading && (
          <div className="flex items-center justify-center rounded-md border border-dashed p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {extractedText && (
          <div>
            <Label>Extracted Text</Label>
            <pre className="mt-2 h-48 w-full overflow-auto rounded-md bg-muted p-3 font-code text-sm">
              <code>{extractedText}</code>
            </pre>
          </div>
        )}
        <DialogFooter>
          <Button onClick={handleUseData} disabled={!extractedText || isLoading}>
            Use This Data
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
