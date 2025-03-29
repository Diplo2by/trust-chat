import React, { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import UserSelector from './chat/UserSelector';
import ChatHeader from './chat/ChatHeader';
import MessageList from './chat/MessageList';
import MessageInput from './chat/MessageInput';
import { Card } from './ui/card';
import { useChatMessages } from '../hooks/useChatMessages';
import { useUsers } from '../hooks/useUsers';
import { useNotifications } from '../hooks/useNotifications';

const ChatComponent: React.FC = () => {
    const { session, logout } = useAuth();
    const [newMessage, setNewMessage] = useState('');
    const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);

    const { users } = useUsers(session);
    const { notificationsEnabled } = useNotifications();
    const {
        messages,
        loading,
        sendMessage
    } = useChatMessages(session, selectedRecipient, notificationsEnabled);


    const handleSendMessage = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedRecipient) return;

        await sendMessage(newMessage);
        setNewMessage('');
    }, [newMessage, selectedRecipient, sendMessage]);

    // If no user is logged in, show login prompt
    if (!session) {
        return (
            <div className="text-center text-gray-500 p-6">
                Please log in to start messaging
            </div>
        );
    }

    return (
        <div className="w-screen mx-auto h-screen flex flex-col bg-emerald-50 p-6">
            <Card className="flex flex-col flex-grow shadow-2xl border-2 border-emerald-600 rounded-xl overflow-hidden">
                <ChatHeader
                    userEmail={session.user.email as string}
                    onLogout={logout}
                >
                    <UserSelector
                        users={users}
                        selectedRecipient={selectedRecipient || ''}
                        onSelectRecipient={setSelectedRecipient}
                    />
                </ChatHeader>

                <MessageList
                    messages={messages}
                    loading={loading}
                    selectedRecipient={selectedRecipient}
                    currentUserId={session.user.id}
                />

                <MessageInput
                    value={newMessage}
                    onChange={setNewMessage}
                    onSubmit={handleSendMessage}
                    disabled={!selectedRecipient}
                />
            </Card>
        </div>
    );
};

export default React.memo(ChatComponent);