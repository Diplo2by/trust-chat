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
import { trace } from '@tauri-apps/plugin-log';

const ChatComponent: React.FC = () => {
    const { session, logout } = useAuth();
    const [newMessage, setNewMessage] = useState('');
    const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);
    const { notificationsEnabled } = useNotifications();

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

    useEffect(() => {
        if (!session) {
            setSelectedRecipient(null);
        }
    }, [session]);

    if (!session) {
        return (
            <div className="flex items-center justify-center h-screen bg-emerald-50">
                <Card className="p-8 shadow-lg text-center text-emerald-800">
                    Please log in to start messaging
                </Card>
            </div>
        );
    }

    return (
        <div className="w-screen h-screen flex bg-emerald-50">
            <Card className="flex flex-col w-full h-full shadow-lg border border-emerald-200 rounded-none overflow-hidden">
                <ChatHeader
                    userEmail={session.user.email as string}
                    onLogout={logout}
                />

                <div className="flex flex-grow h-full overflow-hidden">
                    {/* Left sidebar */}
                    <div className=" w-80 border-r border-emerald-200 flex flex-col bg-white">
                        <Tabs defaultValue="friends" className="w-full ">
                            <TabsList className="grid grid-cols-3 p-0 rounded-none border-b border-emerald-200 w-full">
                                <TabsTrigger value="friends" className=" rounded-tl-md py-3 ">Friends</TabsTrigger>
                                <TabsTrigger value="requests" className="rounded-none py-3">
                                    Requests
                                    {friendRequests.length > 0 && (
                                        <span className="ml-2 inline-flex items-center justify-center bg-emerald-600 text-white text-xs font-medium rounded-full h-5 w-5">
                                            {friendRequests.length}
                                        </span>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger value="add" className=" rounded-tr-md py-2">Add</TabsTrigger>
                            </TabsList>

                            <TabsContent value="friends" className="h-full overflow-hidden">
                                <FriendsList
                                    friends={friends}
                                    selectedRecipient={selectedRecipient || ''}
                                    onSelectRecipient={setSelectedRecipient}
                                    isLoading={friendsLoading}
                                />
                            </TabsContent>

                            <TabsContent value="requests" className=" h-full overflow-clip">
                                <FriendRequests
                                    requests={friendRequests}
                                    onAccept={acceptFriendRequest}
                                    onDecline={declineFriendRequest}
                                    isLoading={friendsLoading}
                                />
                            </TabsContent>

                            <TabsContent value="add" className="h-full overflow-hidden">
                                <AddFriend onSendRequest={sendFriendRequest} />
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Main chat area */}
                    <div className="flex-1 flex flex-col h-full">
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
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default React.memo(ChatComponent);