
import { TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, AlertCircle } from "lucide-react";

interface TabTriggerWithStatusProps {
  value: string;
  children: React.ReactNode;
  isComplete: boolean;
}

export const TabTriggerWithStatus = ({
  value,
  children,
  isComplete
}: TabTriggerWithStatusProps) => (
  <TabsTrigger value={value} className="flex items-center gap-2">
    {children}
    {isComplete && <CheckCircle className="w-4 h-4 text-green-500" />}
    {!isComplete && <AlertCircle className="w-4 h-4 text-orange-500" />}
  </TabsTrigger>
);
