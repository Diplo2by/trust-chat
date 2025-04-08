import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import FriendsList from '@/components/friends/FriendList';
import FriendRequests from '@/components/friends/FriendRequests';
import AddFriend from '@/components/friends/AddFriend';
import ChatHeader from './chat/ChatHeader';
import MessageList from './chat/MessageList';
import MessageInput from './chat/MessageInput';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useChatMessages } from '../hooks/useChatMessages';
import { useFriends } from '../hooks/useFriends';
import { useNotifications } from '../hooks/useNotifications';
import { trace } from '@tauri-apps/plugin-log'


const ChatComponent: React.FC = () => {
    const { session, logout } = useAuth();
    const [newMessage, setNewMessage] = useState('');
    const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);
    const { notificationsEnabled } = useNotifications();

    // Use our new useFriends hook instead of useUsers
    const {
        friends,
        friendRequests,
        sendFriendRequest,
        acceptFriendRequest,
        declineFriendRequest,
        loading: friendsLoading
    } = useFriends(session);

    const {
        messages,
        loading: messagesLoading,
        sendMessage
    } = useChatMessages(session, selectedRecipient, notificationsEnabled);

    const handleSendMessage = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedRecipient) return;
        await sendMessage(newMessage);
        setNewMessage('');
    }, [newMessage, selectedRecipient, sendMessage]);

    // Clear selected recipient when logging out
    useEffect(() => {
        if (!session) {
            setSelectedRecipient(null);
        }
    }, [session]);

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
                    <Tabs defaultValue="friends" className="w-full">
                        <TabsList className="grid grid-cols-3">
                            <TabsTrigger value="friends">Friends</TabsTrigger>
                            <TabsTrigger value="requests">
                                Requests
                                {friendRequests.length > 0 && (
                                    <span className="ml-2 inline-flex items-center justify-center bg-emerald-700 text-white text-xs font-bold rounded-full h-5 w-5">
                                        {friendRequests.length}
                                    </span>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="add">Add Friend</TabsTrigger>
                        </TabsList>

                        <TabsContent value="friends" className="mt-2">
                            <FriendsList
                                friends={friends}
                                selectedRecipient={selectedRecipient || ''}
                                onSelectRecipient={setSelectedRecipient}
                                isLoading={friendsLoading}
                            />
                        </TabsContent>

                        <TabsContent value="requests" className="mt-2">
                            <FriendRequests
                                requests={friendRequests}
                                onAccept={acceptFriendRequest}
                                onDecline={declineFriendRequest}
                                isLoading={friendsLoading}
                            />
                        </TabsContent>

                        <TabsContent value="add" className="mt-2">
                            <AddFriend onSendRequest={sendFriendRequest} />
                        </TabsContent>
                    </Tabs>
                </ChatHeader>

                <MessageList
                    messages={messages}
                    loading={messagesLoading}
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