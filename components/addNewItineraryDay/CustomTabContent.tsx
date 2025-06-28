import ErrorMessage from "@/components/addNewItineraryDay/ErrorMessage";
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import {cn} from "@/lib/utils";
import {Label} from "@radix-ui/react-label";
import {TabsContent} from "@radix-ui/react-tabs";
import {TrashIcon, Plus} from "lucide-react";
import {Input} from "@/components/ui/input";
import {
  FieldErrors,
  UseFieldArrayRemove,
  UseFormGetFieldState,
  UseFormRegister,
} from "react-hook-form";
import {ItineraryType} from "@/components/addNewItineraryDay/ItineraryDayForm";

type TabContentProps = {
  tabName: "morning" | "afternoon" | "evening";
  addNewControl: (fieldArrayName: string) => void;
  register: UseFormRegister<{
    itinerary: ItineraryType;
  }>;
  fields: {
    description: string;
    brief: string;
    id: string;
  }[];
  errors: FieldErrors<{
    itinerary: ItineraryType;
  }>;
  getFieldState: UseFormGetFieldState<{
    itinerary: ItineraryType;
  }>;
  remove: UseFieldArrayRemove;
};

export default function CustomTabContent({
  tabName,
  register,
  fields,
  errors,
  getFieldState,
  remove,
  addNewControl,
}: TabContentProps) {
  return (
    <TabsContent value={tabName}>
      {fields.map((field, index) => {
        const errorForFieldPlaceName =
          errors?.itinerary?.[tabName]?.[index]?.brief;
        const errorForFieldPlaceDesc =
          errors?.itinerary?.[tabName]?.[index]?.description;

        const briefState = getFieldState(
          `itinerary.${tabName}.${index}.brief`
        );
        const descriptionState = getFieldState(
          `itinerary.${tabName}.${index}.description`
        );

        return (
          <div
            className="flex flex-col gap-5 w-full justify-start items-center
                    mt-2 bg-background px-3 py-2 rounded-lg"
            key={field.id}
          >
            <div className="flex flex-col gap-2 justify-center items-start w-full">
              <div className="flex justify-between w-full items-center">
                <Label
                  className="text-sm font-bold font-sans tracking-wide"
                  htmlFor={`itinerary.${tabName}.${index}.brief`}
                >
                  Name of the Place
                </Label>
                <Button
                  className="text-gray-500 rounded-full p-3"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                >
                  <TrashIcon className="w-4 h-4 hover:text-red-500" />
                </Button>
              </div>
              <Input
                {...register(`itinerary.${tabName}.${index}.brief` as const)}
                placeholder="Name of the place"
                defaultValue={field.brief}
                id={`itinerary.${tabName}.${index}.brief`}
                className={cn(
                  "border p-2 border-gray-300 w-full flex-1",
                  briefState.isTouched &&
                    errorForFieldPlaceName &&
                    "border-red-500 border-2"
                )}
              />
              <ErrorMessage
                error={errorForFieldPlaceName}
                isTouched={briefState.isTouched}
              />
            </div>
            <div className="flex flex-col gap-2 justify-center items-start w-full">
              <Label
                htmlFor={`itinerary.${tabName}.${index}.description`}
                className="text-sm font-bold font-sans tracking-wide"
              >
                Description of the place
              </Label>

              <Textarea
                {...register(`itinerary.${tabName}.${index}.description` as const)}
                placeholder="How would you describe it?"
                defaultValue={field.description}
                id={`itinerary.${tabName}.${index}.description`}
                className={cn(
                  "border p-2 border-gray-300 w-full",
                  descriptionState.isTouched &&
                    errorForFieldPlaceDesc &&
                    "border-red-500 border-2"
                )}
              />
              {errorForFieldPlaceDesc?.message && descriptionState.isTouched && (
                <p className="text-sm font-thin text-red-400">{errorForFieldPlaceDesc?.message}</p>
              )}
            </div>
          </div>
        );
      })}
      <Button onClick={() => addNewControl(tabName)} variant="outline" className="text-center">
        <Plus /> Add New Place
      </Button>
    </TabsContent>
  );
}
