import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';

// Types for messages and context
export interface Message {
    id?: number;
    content: string;
    user_id: string;
    created_at: string;
    users?: {
        email: string;
    };
}

interface ChatContextType {
    messages: Message[];
    sendMessage: (content: string) => Promise<void>;
    loading: boolean;
}

const ChatContext = createContext<ChatContextType>({
    messages: [],
    sendMessage: async () => { },
    loading: false
});

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const { session } = useAuth();

    // Fetch messages
    useEffect(() => {
        if (!session) return;

        const fetchMessages = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('messages')
                    .select('*, users(email)')
                    .order('created_at', { ascending: true });

                if (error) throw error;
                setMessages(data || []);
            } catch (error) {
                console.error('Error fetching messages:', error);
            } finally {
                setLoading(false);
            }
        };

        // Initial fetch
        fetchMessages();

        // Real-time subscription
        const channel = supabase
            .channel('messages')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages' },
                (payload) => {
                    setMessages((prevMessages) => [...prevMessages, payload.new as Message]);
                }
            )
            .subscribe();

        // Cleanup subscription
        return () => {
            supabase.removeChannel(channel);
        };
    }, [session]);

    // Send message
    const sendMessage = async (content: string) => {
        if (!session) return;

        try {
            const { error } = await supabase.from('messages').insert({
                content,
                user_id: session.user.id,
                created_at: new Date().toISOString()
            });

            if (error) throw error;
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <ChatContext.Provider value={{ messages, sendMessage, loading }}>
            {children}
        </ChatContext.Provider>
    );
};

// Custom hook to use chat context
export const useChat = () => useContext(ChatContext);