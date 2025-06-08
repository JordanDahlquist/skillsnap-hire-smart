
import { TabsList } from "@/components/ui/tabs";
import { FileText, MapPin, Sparkles, ClipboardList } from "lucide-react";
import { TabTriggerWithStatus } from "../ui-components/TabTriggerWithStatus";

interface NavigationTabsProps {
  tabCompletion: {
    tab1Complete: boolean;
    tab2Complete: boolean;
    tab3Complete: boolean;
    tab4Complete: boolean;
  };
}

export const NavigationTabs = ({ tabCompletion }: NavigationTabsProps) => {
  return (
    <TabsList className="grid w-full grid-cols-4">
      <TabTriggerWithStatus value="1" isComplete={tabCompletion.tab1Complete}>
        <FileText className="w-4 h-4" />
        Role Details
      </TabTriggerWithStatus>
      <TabTriggerWithStatus value="2" isComplete={tabCompletion.tab2Complete}>
        <MapPin className="w-4 h-4" />
        Location
      </TabTriggerWithStatus>
      <TabTriggerWithStatus value="3" isComplete={tabCompletion.tab3Complete}>
        <Sparkles className="w-4 h-4" />
        AI Job Post
      </TabTriggerWithStatus>
      <TabTriggerWithStatus value="4" isComplete={tabCompletion.tab4Complete}>
        <ClipboardList className="w-4 h-4" />
        Skills Test
      </TabTriggerWithStatus>
    </TabsList>
  );
};
