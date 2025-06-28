"use client";
import {Input} from "@/components/ui/input";
import {ChangeEvent, MouseEvent, useState, useEffect} from "react";
import {Loading} from "@/components/shared/Loading";
import {Id} from "@/convex/_generated/dataModel";
import {useMutation} from "convex/react";
import {api} from "@/convex/_generated/api";
import {Search} from "lucide-react";
import {useToast} from "@/components/ui/use-toast";

type LocationAutoCompletePropType = {
  planId: string;
  addNewPlaceToTopPlaces: (lat: number, lng: number, placeName: string) => void;
};

type PlacePrediction = {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
};

const LocationAutoComplete = ({planId, addNewPlaceToTopPlaces}: LocationAutoCompletePropType) => {
  const [showReults, setShowResults] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const {toast} = useToast();

  const updatePlaceToVisit = useMutation(api.plan.updatePlaceToVisit);

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
          types: 'establishment|geocode',
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
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&types=establishment|geocode&key=${apiKey}`
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

  const hadleSelectItem = async (e: MouseEvent<HTMLLIElement>, placeId: string) => {
    e.stopPropagation();
    setShowResults(false);
    setIsSaving(true);
    const {dismiss} = toast({
      description: `Adding the selected place!`,
    });

    try {
      // Get place details using the newer Places API
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        throw new Error('Google Maps API key is not configured');
      }

      // Use a proxy approach to avoid CORS issues
      const response = await fetch('/api/places/details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          placeId: placeId,
          fields: 'name,geometry',
          apiKey: apiKey
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.result) {
        const place = data.result;
        const lat = place.geometry?.location?.lat;
        const lng = place.geometry?.location?.lng;
        const name = place.name;

        if (lat && lng && name) {
          await updatePlaceToVisit({
            placeName: name,
            lat,
            lng,
            planId: planId as Id<"plan">,
          });
          
          setSearchQuery("");
          setIsSaving(false);
          dismiss();
          addNewPlaceToTopPlaces(lat, lng, name);
        } else {
          setIsSaving(false);
          dismiss();
        }
      } else if (data.status === 'REQUEST_DENIED') {
        console.error('Google Maps API request denied. Check your API key and billing setup.');
        setIsSaving(false);
        dismiss();
      } else if (data.status === 'OVER_QUERY_LIMIT') {
        console.error('Google Maps API quota exceeded.');
        setIsSaving(false);
        dismiss();
      } else {
        console.error('Google Maps API error:', data.status, data.error_message);
        setIsSaving(false);
        dismiss();
      }
    } catch (error) {
      console.error('Error getting place details:', error);
      // Fallback: try direct API call as backup
      try {
        const directResponse = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,geometry&key=${apiKey}`
        );
        
        if (directResponse.ok) {
          const directData = await directResponse.json();
          if (directData.status === 'OK' && directData.result) {
            const place = directData.result;
            const lat = place.geometry?.location?.lat;
            const lng = place.geometry?.location?.lng;
            const name = place.name;

            if (lat && lng && name) {
              await updatePlaceToVisit({
                placeName: name,
                lat,
                lng,
                planId: planId as Id<"plan">,
              });
              
              setSearchQuery("");
              setIsSaving(false);
              dismiss();
              addNewPlaceToTopPlaces(lat, lng, name);
              return;
            }
          }
        }
      } catch (fallbackError) {
        console.error('Fallback API call also failed:', fallbackError);
      }
      setIsSaving(false);
      dismiss();
    }
  };

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
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
      if (searchQuery) {
        getPlacePredictions(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  return (
    <div className="relative">
      <div className="relative ">
        <Input
          disabled={isSaving}
          type="text"
          className="font-light h-12"
          placeholder="Search new location"
          onChange={handleSearch}
          value={searchQuery}
          onBlur={() => setShowResults(false)}
        />
        {isLoading ? (
          <div className="absolute right-3 top-0 h-full flex items-center">
            <Loading className="w-6 h-6" />
          </div>
        ) : (
          <div className="absolute right-3 top-0 h-full flex items-center">
            <Search className="w-4 h-4" />
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
          <ul className="w-full flex flex-col gap-2" onMouseDown={(e) => e.preventDefault()}>
            {predictions.map((item) => (
              <li
                className="cursor-pointer
                border-b 
                flex justify-between items-center
                hover:bg-muted hover:rounded-lg
                px-1 py-2 text-sm"
                onClick={(e) => hadleSelectItem(e, item.place_id)}
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

export default LocationAutoComplete;
