"use client";
import { Input } from "@/components/ui/input";
import {
  ChangeEvent,
  Dispatch,
  MouseEvent,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { Loading } from "@/components/shared/Loading";
import { ControllerRenderProps, UseFormReturn } from "react-hook-form";
import { formSchemaType } from "@/components/NewPlanForm";

type PlacesAutoCompleteProps = {
  selectedFromList: boolean;
  setSelectedFromList: Dispatch<SetStateAction<boolean>>;
  form: UseFormReturn<formSchemaType, any, undefined>;
  field: ControllerRenderProps<formSchemaType, "placeName">;
};

type PlacePrediction = {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
};

const PlacesAutoComplete = ({
  form,
  field,
  selectedFromList,
  setSelectedFromList,
}: PlacesAutoCompleteProps) => {
  const [showReults, setShowResults] = useState(false);
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const isEnglish = (text: string) => /^[A-Za-z0-9\s,.-]+$/.test(text);

  // Debug: Log API key status (remove in production)
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ Google Maps API key is not configured. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment variables.');
    } else {
      console.log('✅ Google Maps API key is configured');
    }
  }, []);

  // Get place predictions using the newer Places API
  const getPlacePredictions = async (input: string) => {
    if (!input.trim()) {
      setPredictions([]);
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('Google Maps API key is not configured');
      setPredictions([]);
      return;
    }

    setIsLoading(true);
    try {
      // Use a proxy approach to avoid CORS issues
      const response = await fetch('/api/places/autocomplete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: input,
          types: '(regions)',
          apiKey: apiKey
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'OK') {
        setPredictions(data.predictions || []);
      } else if (data.status === 'REQUEST_DENIED') {
        console.error('Google Maps API request denied. Check your API key and billing setup.');
        setPredictions([]);
      } else if (data.status === 'OVER_QUERY_LIMIT') {
        console.error('Google Maps API quota exceeded.');
        setPredictions([]);
      } else {
        console.error('Google Maps API error:', data.status, data.error_message);
        setPredictions([]);
      }
    } catch (error) {
      console.error('Error getting place predictions:', error);
      // Fallback: try direct API call as backup
      try {
        const directResponse = await fetch(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&types=(regions)&key=${apiKey}`
        );
        
        if (directResponse.ok) {
          const directData = await directResponse.json();
          if (directData.status === 'OK') {
            setPredictions(directData.predictions || []);
            return;
          }
        }
      } catch (fallbackError) {
        console.error('Fallback API call also failed:', fallbackError);
      }
      setPredictions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const hadleSelectItem = (
    e: MouseEvent<HTMLLIElement>,
    description: string
  ) => {
    e.stopPropagation();
    form.clearErrors("placeName");

    setShowResults(false);
    setSelectedFromList(true);

    form.setValue("placeName", description);
  };

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) {
      field.onChange(e.target.value);
      return;
    }
    if (!isEnglish(e.target.value)) {
      form.setError("placeName", {
        message: "This tool supports only english as input as of now.",
        type: "custom",
      });
      return;
    }

    if (selectedFromList) {
      form.setError("placeName", {
        message: "Place should be selected from the list",
        type: "custom",
      });
      setSelectedFromList(false);
    }

    const value = e.target.value;
    field.onChange(e.target.value);

    //predictions
    if (value) {
      getPlacePredictions(value);
      setShowResults(true);
    } else {
      setShowResults(false);
      setPredictions([]);
    }
  };

  // Debounce search to avoid too many API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (field.value) {
        getPlacePredictions(field.value);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [field.value]);

  return (
    <div className="relative">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search for your destination city..."
          onChange={handleSearch}
          onBlur={() => setShowResults(false)}
          value={field.value}
        />
        {isLoading && (
          <div className="absolute right-3 top-0 h-full flex items-center">
            <Loading className="w-6 h-6" />
          </div>
        )}
      </div>
      {showReults && predictions.length > 0 && (
        <div
          className="absolute w-full
        mt-2 shadow-md rounded-xl p-1 bg-background max-h-80 overflow-auto
        z-50"
          onMouseDown={(e) => e.preventDefault()}
        >
          <ul
            className="w-full flex flex-col gap-2"
            onMouseDown={(e) => e.preventDefault()}
          >
            {predictions.map((item) => (
              <li
                className="cursor-pointer
                border-b 
                flex justify-between items-center
                hover:bg-muted hover:rounded-lg
                px-1 py-2 text-sm"
                onClick={(e) => hadleSelectItem(e, item.description)}
                key={item.place_id}
              >
                {item.description}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PlacesAutoComplete;
