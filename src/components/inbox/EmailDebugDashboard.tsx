
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, CheckCircle, XCircle, RefreshCw, Mail, Settings, Database } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface WebhookTest {
  timestamp: string;
  status: 'success' | 'error';
  message: string;
  data?: any;
}

export const EmailDebugDashboard = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [webhookTests, setWebhookTests] = useState<WebhookTest[]>([]);
  const [emailStats, setEmailStats] = useState({
    totalThreads: 0,
    totalMessages: 0,
    inboundMessages: 0,
    outboundMessages: 0,
    lastInboundMessage: null as string | null,
    lastOutboundMessage: null as string | null
  });

  // Load email statistics
  const loadEmailStats = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      // Get thread count
      const { count: threadCount } = await supabase
        .from('email_threads')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.user.id);

      // Get message stats
      const { data: messages } = await supabase
        .from('email_messages')
        .select('direction, created_at, thread_id, email_threads!inner(user_id)')
        .eq('email_threads.user_id', user.user.id)
        .order('created_at', { ascending: false })
        .limit(1000);

      if (messages) {
        const inbound = messages.filter(m => m.direction === 'inbound');
        const outbound = messages.filter(m => m.direction === 'outbound');
        
        setEmailStats({
          totalThreads: threadCount || 0,
          totalMessages: messages.length,
          inboundMessages: inbound.length,
          outboundMessages: outbound.length,
          lastInboundMessage: inbound[0]?.created_at || null,
          lastOutboundMessage: outbound[0]?.created_at || null
        });
      }
    } catch (error) {
      console.error('Failed to load email stats:', error);
    }
  };

  // Test webhook endpoint
  const testWebhookEndpoint = async () => {
    setIsLoading(true);
    try {
      const testPayload = {
        type: 'inbound.message',
        data: {
          from: { email: 'test@example.com', name: 'Test User' },
          recipients: {
            to: { data: [{ email: 'jordan-dahlquist@inbound.atract.ai', name: 'Jordan' }] },
            rcptTo: [{ email: 'jordan-dahlquist@inbound.atract.ai' }]
          },
          subject: 'Test Email - Debug',
          text: 'This is a test email for debugging',
          html: '<p>This is a test email for debugging</p>',
          id: 'test-' + Date.now(),
          headers: {
            'Message-ID': 'test-message-' + Date.now()
          }
        }
      };

      console.log('Testing webhook with payload:', testPayload);
      
      const { data, error } = await supabase.functions.invoke('handle-email-webhook', {
        body: testPayload
      });

      const testResult: WebhookTest = {
        timestamp: new Date().toISOString(),
        status: error ? 'error' : 'success',
        message: error ? error.message : 'Webhook test successful',
        data: data
      };

      setWebhookTests(prev => [testResult, ...prev.slice(0, 9)]);
      
      if (error) {
        toast({
          title: "Webhook Test Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Webhook Test Successful",
          description: "The webhook endpoint is responding correctly",
        });
      }
    } catch (error: any) {
      const testResult: WebhookTest = {
        timestamp: new Date().toISOString(),
        status: 'error',
        message: error.message,
        data: null
      };
      
      setWebhookTests(prev => [testResult, ...prev.slice(0, 9)]);
      
      toast({
        title: "Webhook Test Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check MailerSend configuration
  const checkMailerSendConfig = async () => {
    try {
      // This would normally check MailerSend API, but we'll simulate for now
      toast({
        title: "MailerSend Check",
        description: "Check your MailerSend dashboard for inbound route configuration",
      });
      
      // Log webhook URL for user reference
      console.log('Expected webhook URL:', 
        `https://wrnscwadcetbimpstnpu.supabase.co/functions/v1/handle-email-webhook`
      );
    } catch (error: any) {
      toast({
        title: "Configuration Check Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadEmailStats();
  }, []);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  const daysSince = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const days = Math.floor((Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24));
    return `${days} days ago`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Email System Debug Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Statistics */}
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Database className="w-4 h-4" />
              Email Statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{emailStats.totalThreads}</div>
                <div className="text-sm text-blue-600">Total Threads</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{emailStats.outboundMessages}</div>
                <div className="text-sm text-green-600">Sent Messages</div>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{emailStats.inboundMessages}</div>
                <div className="text-sm text-orange-600">Received Messages</div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{emailStats.totalMessages}</div>
                <div className="text-sm text-purple-600">Total Messages</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Last Activity */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Last Email Activity</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                <span className="text-sm font-medium">Last Sent Email:</span>
                <div className="text-right">
                  <div className="text-sm">{formatDate(emailStats.lastOutboundMessage)}</div>
                  <div className="text-xs text-gray-500">{daysSince(emailStats.lastOutboundMessage)}</div>
                </div>
              </div>
              <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
                <span className="text-sm font-medium">Last Received Email:</span>
                <div className="text-right">
                  <div className="text-sm">{formatDate(emailStats.lastInboundMessage)}</div>
                  <div className="text-xs text-gray-500">{daysSince(emailStats.lastInboundMessage)}</div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Diagnostic Actions */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Diagnostic Actions</h3>
            <div className="flex flex-wrap gap-3">
              <Button onClick={testWebhookEndpoint} disabled={isLoading} size="sm">
                <Mail className="w-4 h-4 mr-2" />
                {isLoading ? 'Testing...' : 'Test Webhook'}
              </Button>
              <Button onClick={checkMailerSendConfig} variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Check Config
              </Button>
              <Button onClick={loadEmailStats} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Stats
              </Button>
            </div>
          </div>

          {/* Webhook Test Results */}
          {webhookTests.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-3">Webhook Test Results</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {webhookTests.map((test, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      {test.status === 'success' ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={test.status === 'success' ? 'default' : 'destructive'}>
                            {test.status}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatDate(test.timestamp)}
                          </span>
                        </div>
                        <div className="text-sm">{test.message}</div>
                        {test.data && (
                          <details className="mt-2">
                            <summary className="text-xs text-gray-500 cursor-pointer">
                              Show response data
                            </summary>
                            <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-x-auto">
                              {JSON.stringify(test.data, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Configuration Info */}
          <Separator />
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Configuration Information
            </h3>
            <div className="space-y-2 text-sm bg-gray-50 p-4 rounded-lg">
              <div><strong>Expected Webhook URL:</strong></div>
              <code className="block bg-white p-2 rounded border text-xs break-all">
                https://wrnscwadcetbimpstnpu.supabase.co/functions/v1/handle-email-webhook
              </code>
              <div className="mt-3"><strong>Inbound Email Domain:</strong></div>
              <code className="block bg-white p-2 rounded border text-xs">
                @inbound.atract.ai
              </code>
              <div className="mt-3 text-orange-600">
                <strong>⚠️ Next Steps:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Check MailerSend dashboard for inbound route configuration</li>
                  <li>Verify webhook URL matches exactly</li>
                  <li>Ensure inbound.atract.ai domain is verified</li>
                  <li>Check MX records for the domain</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
