import { ItineraryValidationSchema } from "@/components/addNewItineraryDay/ItineraryValidationSchema";
import { useZodForm } from "@/hooks/useZodForm";
import { useRef } from "react";
import { useFieldArray, FieldArrayWithId } from 'react-hook-form';
import { z } from "zod";

const useItineraryForm = (planId: string) => {

    const ref = useRef({
        afternoon: false,
        evening: false,
    });

    const {
        handleSubmit,
        register,
        control,
        getFieldState,
        formState: { isValid, errors, isDirty },
    } = useZodForm({
        schema: ItineraryValidationSchema,
        defaultValues: {
            itinerary: {
                title: "New Day",
                morning: [
                    {
                        description: "",
                        brief: "",
                    },
                ],
                afternoon: [],
                evening: [],
            },
        },
        mode: "onTouched",
    });


    const {
        fields: morningFields,
        append: appendMorning,
        remove: removeMorning,
    } = useFieldArray({
        name: "itinerary.morning",
        control,
    });

    const {
        fields: afternoonFields,
        append: appendAfternoon,
        remove: removeAfternoon,
    } = useFieldArray({
        name: "itinerary.afternoon",
        control,
    });

    const {
        fields: eveningFields,
        append: appendEvening,
        remove: removeEvening,
    } = useFieldArray({
        name: "itinerary.evening",
        control,
    });

    const addNewControl = (fieldArrayName: string) => {
        switch (fieldArrayName) {
            case "morning":
                appendMorning({
                    description: "",
                    brief: "",
                });
                break;
            case "afternoon":
                appendAfternoon({
                    description: "",
                    brief: "",
                }, {
                    shouldFocus: false,
                    focusIndex: -1
                });
                break;
            case "evening":
                appendEvening({
                    description: "",
                    brief: "",
                });
                break;
            default:
                break;
        }
    };

    const handleTabChange = (value: string) => {
        switch (value) {
            case "afternoon": {
                if (!ref.current.afternoon) {
                    ref.current.afternoon = true;
                    appendAfternoon({
                        description: "",
                        brief: "",
                    });
                }
                break;
            }
            case "evening": {
                if (!ref.current.evening) {
                    ref.current.evening = true;
                    appendEvening({
                        description: "",
                        brief: "",
                    });
                }
                break;
            }

            default:
                break;
        }
    };

    return (
        {
            register,
            handleSubmit,
            handleTabChange,
            morningFields,
            afternoonFields,
            eveningFields,
            addNewControl,
            getFieldState,
            removeMorning,
            removeAfternoon,
            removeEvening,
            isValid,
            errors,
            isDirty,
        }
    )
}


export default useItineraryForm