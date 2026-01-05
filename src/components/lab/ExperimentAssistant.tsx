import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X, Send, Bot, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Experiment } from '@/utils/constants';
import { generateAIResponse } from '@/services/aiService';

interface Message {
    role: 'user' | 'assistant';
    text: string;
}

interface ExperimentAssistantProps {
    experiment: Experiment;
}

export function ExperimentAssistant({ experiment }: ExperimentAssistantProps) {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [offline, setOffline] = useState(!navigator.onLine);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Listen for online/offline events
    useEffect(() => {
        const handleOnline = () => setOffline(false);
        const handleOffline = () => setOffline(true);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Auto-scroll to bottom when new messages appear
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput('');
        setIsLoading(true);

        // Add user message immediately
        setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);

        if (offline) {
            // Offline fallback
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    text: `You are offline. Here is a hint: ${experiment.title} involves ${experiment.subject} concepts. Try asking when you're back online!`,
                },
            ]);
            setIsLoading(false); // Ensure loading state is reset if offline
            return;
        }

        try {
            // Call AI service
            const response = await generateAIResponse(userMsg, experiment);
            setMessages((prev) => [...prev, { role: 'assistant', text: response }]);
        } catch (error) {
            console.error('Error getting AI response:', error);
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    text: 'Sorry, I encountered an error. Please try again.',
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Floating Chat Button */}
            <Button
                variant="default"
                className="fixed bottom-6 right-6 z-50 flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow"
                onClick={() => setOpen(true)}
            >
                <Bot className="h-5 w-5" /> Ask Lab Assistant 🤖
            </Button>

            {/* Chat Modal */}
            {open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <Card className="w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl">
                        {/* Header */}
                        <CardHeader className="flex flex-row items-center justify-between p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-b">
                            <CardTitle className="text-base md:text-lg flex items-center gap-2">
                                <Bot className="h-5 w-5 text-primary" />
                                <span className="truncate">{experiment.title} Assistant</span>
                            </CardTitle>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setOpen(false)}
                                className="shrink-0"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </CardHeader>

                        {/* Messages */}
                        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.length === 0 && (
                                <div className="text-center py-8">
                                    <Bot className="h-12 w-12 mx-auto mb-3 text-primary/40" />
                                    <p className="text-sm text-muted-foreground">
                                        {offline
                                            ? '🔌 You are offline. Connect to the internet to chat.'
                                            : `👋 Hi! I'm your AI Lab Assistant for ${experiment.title}. Ask me how to perform the steps or clarify concepts!`}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        I can help in English or Nepali (नेपाली)
                                    </p>
                                </div>
                            )}

                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`rounded-2xl px-4 py-2 max-w-[85%] break-words ${msg.role === 'user'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted/80 text-foreground'
                                            }`}
                                    >
                                        <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                    </div>
                                </div>
                            ))}

                            {/* Loading indicator */}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="rounded-2xl px-4 py-2 bg-muted/80 flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                        <span className="text-sm text-muted-foreground">Thinking...</span>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </CardContent>

                        {/* Input Footer */}
                        <CardFooter className="p-4 border-t bg-muted/20">
                            <div className="flex w-full gap-2">
                                <input
                                    type="text"
                                    placeholder={
                                        offline
                                            ? 'Offline – chat disabled'
                                            : 'Ask a question...'
                                    }
                                    className="flex-1 rounded-lg border border-input bg-background px-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    disabled={offline || isLoading}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                />
                                <Button
                                    variant="default"
                                    size="icon"
                                    onClick={handleSend}
                                    disabled={offline || !input.trim() || isLoading}
                                    className="shrink-0"
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Send className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </>
    );
}
