import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Send, MessageCircle, Users, LogOut } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {  trace } from '@tauri-apps/plugin-log'

interface Message {
    id: number;
    content: string;
    user_id: string;
    recipient_id: string;
    created_at: string;
}

interface User {
    id: string;
    email: string;
}

const ChatComponent: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);
    const { session, logout } = useAuth();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    // Fetch all users except the current user
    const fetchUsers = useCallback(async () => {
        if (!session) return;

        try {
            const { data, error } = await supabase
                .from('users')  // Assumes you have a 'users' table
                .select('id, email')
                .neq('id', session.user.id);
            trace("Data " + data?.toString() as string)

            if (error) {
                trace(error.message)
                throw error;
            }
            setUsers(data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    }, [session]);

    // Fetch messages for the current conversation
    const fetchMessages = useCallback(async () => {
        if (!session || !selectedRecipient) return;

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .or(`user_id.eq.${session.user.id},recipient_id.eq.${session.user.id}`)
                .or(`user_id.eq.${selectedRecipient},recipient_id.eq.${selectedRecipient}`)
                .order('created_at', { ascending: true })
                .limit(100);

            if (error) throw error;
            setMessages(data || []);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    }, [session, selectedRecipient]);

    // Initial fetch of users and messages
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    useEffect(() => {
        if (selectedRecipient) {
            fetchMessages();
        }
    }, [fetchMessages, selectedRecipient]);

    // Real-time message subscription
    useEffect(() => {
        if (!session || !selectedRecipient) return;

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
                    const newMessage = payload.new as Message;
                    // Only add message if it's part of the current conversation
                    if ((newMessage.user_id === session.user.id && newMessage.recipient_id === selectedRecipient) ||
                        (newMessage.user_id === selectedRecipient && newMessage.recipient_id === session.user.id)) {
                        setMessages((prevMessages) => {
                            const isDuplicate = prevMessages.some(
                                (msg) => msg.id === newMessage.id
                            );

                            return isDuplicate
                                ? prevMessages
                                : [...prevMessages, newMessage];
                        });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [session, selectedRecipient]);

    // Scroll to bottom when messages change
    const scrollToBottom = useCallback(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(scrollToBottom, 100);
        return () => clearTimeout(timer);
    }, [messages, scrollToBottom]);

    // Send message handler
    const handleSendMessage = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newMessage.trim() || !session || !selectedRecipient) return;

        const optimisticMessage: Message = {
            id: Date.now(),
            content: newMessage,
            user_id: session.user.id,
            recipient_id: selectedRecipient,
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
                    recipient_id: selectedRecipient,
                    created_at: new Date().toISOString()
                });

            if (error) throw error;
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages((prev) => prev.filter(msg => msg.id !== optimisticMessage.id));
        }
    }, [newMessage, session, selectedRecipient]);

    // Render messages with different styling for sent/received
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

    const handleLogout = useCallback(async () => {
        try {
            await logout(); // Use the logout method from AuthContext
        } catch (error) {
            console.error('Logout error:', error);
        }
    }, [logout]);

    // If no user is logged in, show login prompt
    if (!session) {
        return (
            <div className="text-center text-gray-500 p-6">
                Please log in to start messaging
            </div>
        );
    }

    return (
        <div className=" w-screen max-w-4xl mx-auto h-screen flex flex-col bg-emerald-50 p-6">
            <Card className="flex flex-col flex-grow shadow-2xl border-2 border-emerald-600 rounded-xl overflow-hidden">
                <CardHeader className="bg-emerald-800 text-white py-4 px-6 flex flex-row items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <MessageCircle size={24} className="text-white" />
                        <CardTitle className="text-xl font-semibold">Trust Chat</CardTitle>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-sm text-emerald-200">
                            Logged in as: {session.user.email}
                        </div>
                        <Select
                            value={selectedRecipient || ''}
                            onValueChange={setSelectedRecipient}
                        >
                            <SelectTrigger className=" w-1/2 bg-red-50 text-emerald-900">
                                <Users size={16} className="mr-2" />
                                <SelectValue placeholder="Select User" />
                            </SelectTrigger>
                            <SelectContent>
                                {users.map(user => (
                                    <SelectItem key={user.id} value={user.id}>
                                        {user.email}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            onClick={handleLogout}
                            variant="destructive"
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            <LogOut size={16} className="mr-2" /> Logout
                        </Button>
                    </div>
                </CardHeader>

                <CardContent
                    ref={messagesContainerRef}
                    className="flex-grow overflow-y-auto p-6 space-y-3 bg-white"
                >
                    {!selectedRecipient ? (
                        <div className="text-center text-gray-500">
                            Please select a user to start messaging
                        </div>
                    ) : loading ? (
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
                        disabled={!selectedRecipient}
                        className="flex-grow border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
                    />
                    <Button
                        type="submit"
                        disabled={newMessage.trim() === '' || !selectedRecipient}
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