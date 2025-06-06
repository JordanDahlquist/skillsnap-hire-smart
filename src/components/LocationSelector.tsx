
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface LocationSelectorProps {
  locationType: string;
  country: string;
  state: string;
  region: string;
  city: string;
  onLocationChange: (field: string, value: string) => void;
}

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
  "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky",
  "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi",
  "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico",
  "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania",
  "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
  "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
];

const US_REGIONS = [
  "Northeast", "Southeast", "Midwest", "Southwest", "West"
];

const COUNTRIES = [
  "United States", "Canada", "United Kingdom", "Germany", "France", "Spain", "Italy", "Netherlands",
  "Sweden", "Norway", "Denmark", "Finland", "Australia", "New Zealand", "Japan", "South Korea",
  "Singapore", "India", "Brazil", "Mexico", "Argentina", "Chile", "Israel", "Switzerland",
  "Austria", "Belgium", "Ireland", "Portugal", "Poland", "Czech Republic", "Hungary", "Romania",
  "Bulgaria", "Croatia", "Slovenia", "Slovakia", "Estonia", "Latvia", "Lithuania", "Ukraine",
  "Russia", "China", "Hong Kong", "Taiwan", "Thailand", "Malaysia", "Indonesia", "Philippines",
  "Vietnam", "South Africa", "Egypt", "Morocco", "Turkey", "UAE", "Saudi Arabia", "Other"
];

export const LocationSelector = ({
  locationType,
  country,
  state,
  region,
  city,
  onLocationChange
}: LocationSelectorProps) => {
  const isUS = country === "United States";
  const isRemote = locationType === "remote";

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="locationType">Work Type</Label>
        <Select value={locationType} onValueChange={(value) => onLocationChange("locationType", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select work type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="remote">Remote</SelectItem>
            <SelectItem value="on-site">On-site</SelectItem>
            <SelectItem value="hybrid">Hybrid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!isRemote && (
        <div>
          <Label htmlFor="country">Country</Label>
          <Select value={country} onValueChange={(value) => onLocationChange("country", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((countryOption) => (
                <SelectItem key={countryOption} value={countryOption}>
                  {countryOption}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {isRemote && (
        <div>
          <Label htmlFor="country">Preferred Region (Optional)</Label>
          <Select value={country} onValueChange={(value) => onLocationChange("country", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Any location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any location</SelectItem>
              {COUNTRIES.map((countryOption) => (
                <SelectItem key={countryOption} value={countryOption}>
                  {countryOption}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {isUS && !isRemote && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="state">State</Label>
            <Select value={state} onValueChange={(value) => onLocationChange("state", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map((stateOption) => (
                  <SelectItem key={stateOption} value={stateOption}>
                    {stateOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="region">Region</Label>
            <Select value={region} onValueChange={(value) => onLocationChange("region", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                {US_REGIONS.map((regionOption) => (
                  <SelectItem key={regionOption} value={regionOption}>
                    {regionOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {!isRemote && (
        <div>
          <Label htmlFor="city">City (Optional)</Label>
          <Input
            id="city"
            placeholder="e.g. San Francisco"
            value={city}
            onChange={(e) => onLocationChange("city", e.target.value)}
          />
        </div>
      )}
    </div>
  );
};
