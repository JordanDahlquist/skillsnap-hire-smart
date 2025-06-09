
import { UnifiedHeader } from '@/components/UnifiedHeader';
import { ScoutChat } from '@/components/scout/ScoutChat';

const Scout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedHeader />
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Scout AI</h1>
          <p className="text-gray-600 mt-2">
            Your intelligent hiring assistant. Ask me anything about your candidates, jobs, or hiring pipeline.
          </p>
        </div>
        
        <div className="h-[calc(100vh-280px)]">
          <ScoutChat />
        </div>
      </div>
    </div>
  );
};

export default Scout;
