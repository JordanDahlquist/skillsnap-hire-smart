
import { UnifiedHeader } from '@/components/UnifiedHeader';
import { ScoutChat } from '@/components/scout/ScoutChat';

const Scout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <UnifiedHeader />
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-6 min-h-0">
        <div className="mb-6 flex-shrink-0">
          <h1 className="text-3xl font-bold text-gray-900">Scout AI</h1>
          <p className="text-gray-600 mt-2">
            Your intelligent hiring assistant. Ask me anything about your candidates, jobs, or hiring pipeline.
          </p>
        </div>
        
        <div className="flex-1 min-h-0">
          <ScoutChat />
        </div>
      </div>
    </div>
  );
};

export default Scout;
