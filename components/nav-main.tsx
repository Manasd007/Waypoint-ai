"use client";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { COMPANION_PREFERENCES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { FilterX } from "lucide-react";

export type FiltersType = {
  companionId: string;
  location: string;
};

export function NavMain({
  initialFilters,
  onFilterChange,
}: {
  initialFilters: {
    companionId?: string;
    location?: string;
  };
  onFilterChange: (filters: FiltersType) => void;
}) {
  const [filters, setFilters] = useState<FiltersType>({
    companionId: initialFilters.companionId || "",
    location: initialFilters.location || "",
  });

  const clearFilter = useCallback(
    (filterName: keyof FiltersType) => {
      const newFilters = {
        ...filters,
        [filterName]: "",
      };
      setFilters(newFilters);
      onFilterChange(newFilters);
    },
    [filters, onFilterChange]
  );

  const onChangeCompanionControl = useCallback(
    (companionId: string) => {
      // If the same companion is clicked again, unselect it
      const newCompanionId =
        filters.companionId === companionId ? "" : companionId;

      const newFilters = {
        ...filters,
        companionId: newCompanionId,
      };
      setFilters(newFilters);
      onFilterChange(newFilters);
    },
    [filters, onFilterChange]
  );

  return (
    <SidebarGroup>
      <SidebarMenu>
        {/* <ActiveFiltersSection
          filters={filters}
          clearFilters={resetAllFilters}
        /> */}
        <SidebarMenuItem
        // className="mt-5"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex h-16 gap-2 items-center">
              <span className="text-md font-bold">Filter by Companion</span>
            </div>

            {filters.companionId && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-red-500 cursor-pointer"
                onClick={() => clearFilter("companionId")}
              >
                <FilterX className="h-4 w-4" />
              </Button>
            )}
          </div>
          <CompanionControl
            value={filters.companionId}
            onChange={onChangeCompanionControl}
          />
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}

const CompanionControl = ({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (companionId: string) => void;
}) => {
  return (
    <div
      className={cn("flex gap-2 flex-col justify-center items-center w-full")}
    >
      {COMPANION_PREFERENCES.map((companion) => (
        <label
          key={companion.id}
          className="flex-1 p-1 opacity-50 hover:opacity-100 dark:opacity-40 dark:hover:opacity-100 
                  has-[:checked]:bg-blue-50 has-[:checked]:text-foreground has-[:checked]:opacity-100
                  dark:has-[:checked]:opacity-100
                  duration-200 transition-all ease-in-out
                  cursor-pointer select-none
                  flex justify-center items-center w-full
                  bg-gray-100 dark:bg-transparent dark:border dark:border-white
                  hover:shadow-sm border-2 border-border has-[:checked]:border-0 has-[:checked]:shadow-md rounded-full"
        >
          <input
            type="radio"
            className="hidden"
            name="companion"
            checked={value == companion.id}
            onChange={(e) => {
              if (e.target.checked) {
                onChange(companion.id);
              }
            }}
          />
          <companion.icon className="w-5 h-5 pr-1" />
          <span>{companion.displayName}</span>
        </label>
      ))}
    </div>
  );
};
