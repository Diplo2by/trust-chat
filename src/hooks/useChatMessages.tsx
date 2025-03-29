import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { error } from '@tauri-apps/plugin-log';
import { sendNotification } from '@tauri-apps/plugin-notification';

interface Message {
    id: number;
    content: string;
    user_id: string;
    recipient_id: string;
    created_at: string;
}

export const useChatMessages = (
    session: any,
    selectedRecipient: string | null,
    notificationsEnabled: boolean
) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);

    // Fetch messages for the current conversation
    const fetchMessages = useCallback(async () => {
        if (!session || !selectedRecipient) return;

        setLoading(true);
        try {
            const { data, error: supabaseError } = await supabase
                .from('messages')
                .select('*')
                .or(`user_id.eq.${session.user.id},recipient_id.eq.${session.user.id}`)
                .or(`user_id.eq.${selectedRecipient},recipient_id.eq.${selectedRecipient}`)
                .order('created_at', { ascending: true })
                .limit(100);

            if (supabaseError) throw supabaseError;
            setMessages(data || []);
        } catch (err: any) {
            error('Error fetching messages:', err);
        } finally {
            setLoading(false);
        }
    }, [session, selectedRecipient]);

    // Send message handler
    const sendMessage = useCallback(async (content: string) => {
        if (!content.trim() || !session || !selectedRecipient) return;

        try {
            const { error: supabaseError } = await supabase
                .from('messages')
                .insert({
                    content,
                    user_id: session.user.id,
                    recipient_id: selectedRecipient,
                    created_at: new Date().toISOString()
                });

            if (supabaseError) throw supabaseError;
        } catch (err: any) {
            error('Error sending message:', err);
        }
    }, [session, selectedRecipient]);

    const sendMessageNotification = useCallback((senderEmail: string, messageContent: string) => {
        if (notificationsEnabled) {
            try {
                sendNotification({
                    title: `New message from ${senderEmail}`,
                    body: messageContent.length > 50 ? messageContent.substring(0, 50) + '...' : messageContent,
                });
            } catch (err) {
                console.error('Error sending notification:', err);
            }
        }
    }, [notificationsEnabled]);

    // Load messages when recipient changes
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

                        // Handle notification if the message is from the selected recipient
                        if (newMessage.user_id === selectedRecipient) {
                            // You'd need to pass the recipient email here
                            const recipientUsers = supabase
                                .from('users')
                                .select('email')
                                .eq('id', newMessage.user_id)
                                .single();

                            recipientUsers.then(({ data }) => {
                                if (data) {
                                    sendMessageNotification(data.email, newMessage.content);
                                }
                            });
                        }
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [session, selectedRecipient, sendMessageNotification]);

    return { messages, loading, sendMessage };
};
