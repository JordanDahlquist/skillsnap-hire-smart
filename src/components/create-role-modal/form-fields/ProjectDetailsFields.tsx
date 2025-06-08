
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Star, DollarSign, Clock } from "lucide-react";

interface ProjectDetailsFieldsProps {
  form: any;
}

export const ProjectDetailsFields = ({ form }: ProjectDetailsFieldsProps) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="required_skills"
        render={({ field }) => (
          <FormItem className="group">
            <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Star className="w-4 h-4 text-purple-500" />
              Required Skills
              <span className="text-red-500 ml-1">*</span>
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Input 
                  placeholder="e.g. JavaScript, React, Node.js, TypeScript" 
                  className="pl-4 pr-4 py-3 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 bg-white/70 backdrop-blur-sm hover:bg-white/90"
                  {...field} 
                />
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300" />
              </div>
            </FormControl>
            <FormDescription className="text-xs text-gray-500">
              Separate skills with commas for better parsing.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="budget"
        render={({ field }) => (
          <FormItem className="group">
            <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <DollarSign className="w-4 h-4 text-green-500" />
              Budget (Optional)
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Input 
                  placeholder="e.g. $80,000 - $120,000 annually" 
                  className="pl-4 pr-4 py-3 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-200 bg-white/70 backdrop-blur-sm hover:bg-white/90"
                  {...field} 
                />
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-green-500 to-emerald-500 transform scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300" />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="duration"
        render={({ field }) => (
          <FormItem className="group">
            <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Clock className="w-4 h-4 text-blue-500" />
              Duration (Optional)
            </FormLabel>
            <FormControl>
              <div className="relative">
                <Input 
                  placeholder="e.g. 6 months, Ongoing, 1 year contract" 
                  className="pl-4 pr-4 py-3 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 bg-white/70 backdrop-blur-sm hover:bg-white/90"
                  {...field} 
                />
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 transform scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300" />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
