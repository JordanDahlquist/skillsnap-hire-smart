
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, Clock, Star } from "lucide-react";
import { EMPLOYMENT_TYPES, EXPERIENCE_LEVELS } from "../utils/constants";

interface BasicInfoFieldsProps {
  form: any;
}

export const BasicInfoFields = ({ form }: BasicInfoFieldsProps) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem className="group">
            <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Briefcase className="w-4 h-4 text-blue-500" />
              Job Title
              <span className="text-red-500 ml-1">*</span>
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Input 
                  placeholder="e.g. Senior Software Engineer" 
                  className="pl-4 pr-4 py-3 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-white/70 backdrop-blur-sm hover:bg-white/90"
                  {...field} 
                />
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300" />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="employment_type"
        render={({ field }) => (
          <FormItem className="group">
            <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Clock className="w-4 h-4 text-green-500" />
              Employment Type
              <span className="text-red-500 ml-1">*</span>
            </FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="pl-4 pr-4 py-3 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 bg-white/70 backdrop-blur-sm hover:bg-white/90">
                  <SelectValue placeholder="Select employment type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-white/95 backdrop-blur-sm border-gray-200">
                {EMPLOYMENT_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value} className="hover:bg-green-50">
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="experience_level"
        render={({ field }) => (
          <FormItem className="group">
            <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Star className="w-4 h-4 text-yellow-500" />
              Experience Level
              <span className="text-red-500 ml-1">*</span>
            </FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger className="pl-4 pr-4 py-3 border-gray-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all duration-200 bg-white/70 backdrop-blur-sm hover:bg-white/90">
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-white/95 backdrop-blur-sm border-gray-200">
                {EXPERIENCE_LEVELS.map(level => (
                  <SelectItem key={level.value} value={level.value} className="hover:bg-yellow-50">
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
