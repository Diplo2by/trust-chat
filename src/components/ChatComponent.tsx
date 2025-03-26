import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Send, MessageCircle } from 'lucide-react';

interface Message {
    id: number;
    content: string;
    user_id: string;
    created_at: string;
}

const ChatComponent: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const { session } = useAuth();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    // Fetching and subscription logic remains the same as previous implementation
    const fetchMessages = useCallback(async () => {
        if (!session) return;

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .order('created_at', { ascending: true })
                .limit(100);

            if (error) throw error;
            setMessages(data || []);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    }, [session]);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    useEffect(() => {
        const channel = supabase
            .channel('messages-channel')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages'
                },
                (payload) => {
                    setMessages((prevMessages) => {
                        const isDuplicate = prevMessages.some(
                            (msg) => msg.id === payload.new.id
                        );

                        return isDuplicate
                            ? prevMessages
                            : [...prevMessages, payload.new as Message];
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const scrollToBottom = useCallback(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(scrollToBottom, 100);
        return () => clearTimeout(timer);
    }, [messages, scrollToBottom]);

    const handleSendMessage = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newMessage.trim() || !session) return;

        const optimisticMessage: Message = {
            id: Date.now(),
            content: newMessage,
            user_id: session.user.id,
            created_at: new Date().toISOString()
        };

        setMessages((prev) => [...prev, optimisticMessage]);
        setNewMessage('');

        try {
            const { error } = await supabase
                .from('messages')
                .insert({
                    content: newMessage,
                    user_id: session.user.id,
                    created_at: new Date().toISOString()
                });

            if (error) throw error;
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages((prev) => prev.filter(msg => msg.id !== optimisticMessage.id));
        }
    }, [newMessage, session]);

    const renderedMessages = useMemo(() =>
        messages.map((message) => (
            <div
                key={message.id}
                className={`flex flex-col ${message.user_id === session?.user.id
                    ? 'items-end'
                    : 'items-start'
                    }`}
            >
                <div
                    className={`max-w-[70%] p-3 rounded-lg mb-2 shadow-sm ${message.user_id === session?.user.id
                        ? 'bg-emerald-700 text-white'
                        : 'bg-emerald-100 text-emerald-900'
                        }`}
                >
                    {message.content}
                </div>
            </div>
        )),
        [messages, session]
    );

    return (
        <div className="w-full max-w-4xl mx-auto h-screen flex flex-col bg-emerald-50 p-6">
            <Card className="flex flex-col flex-grow shadow-2xl border-2 border-emerald-600 rounded-xl overflow-hidden">
                <CardHeader className="bg-emerald-800 text-white py-4 px-6 flex flex-row items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <MessageCircle size={24} className="text-white" />
                        <CardTitle className="text-xl font-semibold">Trust Chat</CardTitle>
                    </div>
                    {session?.user && (
                        <div className="text-sm text-emerald-200">
                            Logged in as: {session.user.email}
                        </div>
                    )}
                </CardHeader>

                <CardContent
                    ref={messagesContainerRef}
                    className="flex-grow overflow-y-auto p-6 space-y-3 bg-white"
                >
                    {loading ? (
                        <div className="text-center text-emerald-700 animate-pulse">
                            Loading messages...
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="text-center text-gray-500">
                            No messages yet. Start the conversation!
                        </div>
                    ) : (
                        renderedMessages
                    )}
                    <div ref={messagesEndRef} />
                </CardContent>

                <form
                    onSubmit={handleSendMessage}
                    className="p-6 bg-emerald-50 border-t border-emerald-200 flex items-center space-x-4"
                >
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-grow border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
                    />
                    <Button
                        type="submit"
                        disabled={newMessage.trim() === ''}
                        className="bg-emerald-700 text-white hover:bg-emerald-600 transition-colors duration-300 px-4"
                    >
                        <Send size={20} className="mr-2" /> Send
                    </Button>
                </form>
            </Card>
        </div>
    );
};

export default React.memo(ChatComponent);