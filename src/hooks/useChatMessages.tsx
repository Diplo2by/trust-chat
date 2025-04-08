import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { error, trace } from '@tauri-apps/plugin-log';
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

    // Cache for user emails to avoid repeated queries
    const [userEmailCache, setUserEmailCache] = useState<Record<string, string>>({});

    // Fetch user email by ID
    const getUserEmail = useCallback(async (userId: string) => {
        // Return from cache if available
        if (userEmailCache[userId]) {
            return userEmailCache[userId];
        }

        try {
            const { data, error: supabaseError } = await supabase
                .from('users')
                .select('email')
                .eq('id', userId)
                .single();

            if (supabaseError) {
                trace(`Error fetching user email: ${supabaseError.message}`);
                return null;
            }

            if (data && data.email) {
                // Update cache
                setUserEmailCache(prev => ({
                    ...prev,
                    [userId]: data.email
                }));
                return data.email;
            }
            return null;
        } catch (err: any) {
            error(`Error in getUserEmail: ${err.message}`);
            return null;
        }
    }, [userEmailCache]);

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

    // Send notification for a message
    const sendMessageNotification = useCallback(async (senderId: string, messageContent: string) => {
        if (!notificationsEnabled) return;

        try {
            const senderEmail = await getUserEmail(senderId);
            if (!senderEmail) {
                trace('Sender email not found for notification');
                return;
            }

            sendNotification({
                title: `New message from ${senderEmail}`,
                body: messageContent.length > 50 ? messageContent.substring(0, 50) + '...' : messageContent,
            });
        } catch (err: any) {
            error(`Error sending notification: ${err.message}`);
        }
    }, [notificationsEnabled, getUserEmail]);

    // Load messages when recipient changes
    useEffect(() => {
        if (selectedRecipient) {
            fetchMessages();
        }
    }, [fetchMessages, selectedRecipient]);

    // Real-time subscription for active conversation
    useEffect(() => {
        if (!session || !selectedRecipient) return;

        const conversationChannel = supabase
            .channel('active-conversation')
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
            supabase.removeChannel(conversationChannel);
        };
    }, [session, selectedRecipient]);

    // Separate real-time subscription for global notifications
    useEffect(() => {
        if (!session || !notificationsEnabled) return;

        const notificationChannel = supabase
            .channel('global-notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages'
                },
                (payload) => {
                    const newMessage = payload.new as Message;

                    // Show notification for any message directed to the current user
                    // from any other user (not just from the selected recipient)
                    if (newMessage.recipient_id === session.user.id &&
                        newMessage.user_id !== session.user.id) {
                        sendMessageNotification(newMessage.user_id, newMessage.content);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(notificationChannel);
        };
    }, [session, notificationsEnabled, sendMessageNotification]);

    return { messages, loading, sendMessage };
};