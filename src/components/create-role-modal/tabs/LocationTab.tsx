
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LocationSelector } from "@/components/LocationSelector";
import { MapPin } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { FormData } from "../utils/types";

interface LocationTabProps {
  form: UseFormReturn<FormData>;
  onLocationChange: (field: string, value: string) => void;
}

export const LocationTab = ({ form, onLocationChange }: LocationTabProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Location & Work Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LocationSelector
            locationType={form.watch("location_type")}
            country={form.watch("country")}
            state={form.watch("state")}
            city={form.watch("city")}
            onLocationChange={onLocationChange}
          />
        </CardContent>
      </Card>
    </div>
  );
};
