"use client";
import {useState} from "react";

import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogTrigger, DialogTitle} from "@/components/ui/dialog";
import {PlusCircleIcon} from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

import ItineraryDayForm from "@/components/addNewItineraryDay/ItineraryDayForm";

export function AddIternaryDay({planId}: {planId: string}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex gap-2">
          <PlusCircleIcon className="h-5 w-5" />
          <span>Add a day</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <VisuallyHidden>
          <DialogTitle>Add Itinerary Day</DialogTitle>
        </VisuallyHidden>
        <ItineraryDayForm planId={planId} setOpen={setOpen} />
      </DialogContent>
    </Dialog>
  );
}
