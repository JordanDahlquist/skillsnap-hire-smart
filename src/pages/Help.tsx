
import { UnifiedHeader } from "@/components/UnifiedHeader";
import { Footer } from "@/components/Footer";
import { HelpContent } from "@/components/help/HelpContent";

const Help = () => {
  const breadcrumbs = [
    { label: "Dashboard", href: "/jobs" },
    { label: "Help", isCurrentPage: true },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <UnifiedHeader breadcrumbs={breadcrumbs} showCreateButton={false} />
      
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 flex-1">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Help Center</h1>
          <p className="mt-2 text-muted-foreground">Everything you need to know about using the platform effectively.</p>
        </div>

        <HelpContent />
      </div>

      <Footer />
    </div>
  );
};

export default Help;
