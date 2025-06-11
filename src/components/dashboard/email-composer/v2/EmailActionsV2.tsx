
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Send, Eye, EyeOff, Loader2, Sparkles } from 'lucide-react';

interface EmailActionsV2Props {
  onSend: () => void;
  onTogglePreview: () => void;
  isSending: boolean;
  canSend: boolean;
  showPreview: boolean;
}

export const EmailActionsV2 = ({
  onSend,
  onTogglePreview,
  isSending,
  canSend,
  showPreview
}: EmailActionsV2Props) => {
  return (
    <Card className="bg-gradient-to-r from-orange-50/50 to-red-50/50 border-0 shadow-lg backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={onSend}
            disabled={!canSend || isSending}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 h-12 text-base font-medium"
          >
            {isSending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Sending Emails...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Send Email Campaign
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={onTogglePreview}
            className="h-12 px-6 border-2 hover:bg-gray-50 transition-all duration-200"
          >
            {showPreview ? (
              <>
                <EyeOff className="w-5 h-5 mr-2" />
                Hide Preview
              </>
            ) : (
              <>
                <Eye className="w-5 h-5 mr-2" />
                Show Preview
              </>
            )}
          </Button>
        </div>

        {/* Action hints */}
        <div className="mt-4 p-3 bg-blue-50/80 rounded-lg border border-blue-200/50">
          <div className="flex items-center gap-2 text-blue-700">
            <Sparkles className="w-4 h-4" />
            <p className="text-sm font-medium">Pro Tips</p>
          </div>
          <ul className="text-xs text-blue-600 mt-2 space-y-1">
            <li>• Use preview to check variable substitution</li>
            <li>• Subject lines under 50 characters perform better</li>
            <li>• Personalized emails increase response rates by 26%</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
