'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

export function AiChatWidget() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
                }),
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let assistantMessage = '';

            const assistantId = (Date.now() + 1).toString();
            setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }]);

            while (reader) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value);
                assistantMessage += chunk;
                setMessages(prev =>
                    prev.map(m => (m.id === assistantId ? { ...m, content: assistantMessage } : m))
                );
            }

            setIsLoading(false);
        } catch (err) {
            console.error('Chat error:', err);
            setError(err instanceof Error ? err.message : 'Failed to send message');
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {!isOpen && (
                <Button onClick={() => setIsOpen(true)} className="h-14 w-14 rounded-full shadow-lg" size="icon">
                    <MessageCircle className="h-6 w-6" />
                </Button>
            )}

            {isOpen && (
                <Card className="w-[350px] h-[500px] flex flex-col shadow-xl border-primary/20">
                    <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Bot className="h-5 w-5 text-primary" />
                            Know Emp AI
                        </CardTitle>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                        <ScrollArea className="flex-1 p-4 max-h-[400px] overflow-y-auto">
                            <div className="flex flex-col gap-4">
                                {messages.length === 0 && !error && (
                                    <div className="text-center text-muted-foreground text-sm mt-10">
                                        <p>Hi! I'm your AI assistant.</p>
                                        <p>Ask me anything about the organization.</p>
                                    </div>
                                )}
                                {messages.map(m => (
                                    <div key={m.id} className={cn('flex gap-2 items-start', m.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
                                        <div className={cn('h-8 w-8 rounded-full flex items-center justify-center shrink-0', m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                                            {m.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                        </div>
                                        <div className={cn('rounded-lg px-3 py-2 text-sm max-w-[80%]', m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground')}>
                                            {m.content}
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex gap-2 items-start">
                                        <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 bg-muted">
                                            <Bot className="h-4 w-4" />
                                        </div>
                                        <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                                            <span className="animate-pulse">Thinking...</span>
                                        </div>
                                    </div>
                                )}
                                {error && (
                                    <div className="flex gap-2 items-start">
                                        <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 bg-destructive/10 text-destructive">
                                            <Bot className="h-4 w-4" />
                                        </div>
                                        <div className="bg-destructive/10 text-destructive rounded-lg px-3 py-2 text-sm">
                                            <p>Error: {error}</p>
                                        </div>
                                    </div>
                                )}
                                <div ref={scrollRef} />
                            </div>
                        </ScrollArea>
                        <div className="p-4 border-t bg-background">
                            <form onSubmit={handleSubmit} className="flex gap-2">
                                <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Type a message..." className="flex-1" />
                                <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                                    <Send className="h-4 w-4" />
                                </Button>
                            </form>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
