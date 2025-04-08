import React, { useRef, useEffect } from 'react';
import { CardContent } from '../ui/card';
import { formatTime, groupMessagesByDate } from '@/util/scripts';
import { Message } from '@/context/ChatContext';
import { MessageCircle } from 'lucide-react';

interface MessageListProps {
    messages: Message[];
    loading: boolean;
    selectedRecipient: string | null;
    currentUserId: string;
}

const MessageList: React.FC<MessageListProps> = ({
    messages,
    loading,
    selectedRecipient,
    currentUserId
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
            }
        }, 100);
        return () => clearTimeout(timer);
    }, [messages]);

    const messageGroups = groupMessagesByDate(messages);

    if (!selectedRecipient) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-white text-emerald-700">
                <MessageCircle size={48} className="mb-4 text-emerald-400" />
                <p>Select a friend to start messaging</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full bg-white">
                <div className="text-emerald-700 animate-pulse">Loading messages...</div>
            </div>
        );
    }

    return (
        <CardContent
            ref={messagesContainerRef}
            className="flex-grow overflow-y-auto p-6 space-y-4 bg-white"
        >
            {messages.length === 0 ? (
                <div className="text-center text-emerald-600 py-8">
                    No messages yet. Start the conversation!
                </div>
            ) : (
                messageGroups.map((group, groupIndex) => (
                    <div key={groupIndex} className="space-y-4">
                        <div className="flex justify-center">
                            <div className="bg-emerald-50 text-emerald-700 text-xs font-medium px-3 py-1 rounded-full">
                                {group.date}
                            </div>
                        </div>

                        {group.messages.map((message) => {
                            const isCurrentUser = message.user_id === currentUserId;
                            return (
                                <div
                                    key={message.id}
                                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className="max-w-[70%]">
                                        <div
                                            className={`p-3 rounded-lg ${isCurrentUser
                                                    ? 'bg-emerald-600 text-white rounded-br-none'
                                                    : 'bg-emerald-100 text-emerald-900 rounded-bl-none'
                                                }`}
                                        >
                                            {message.content}
                                        </div>
                                        <div
                                            className={`text-xs mt-1 text-gray-500 ${isCurrentUser ? 'text-right' : 'text-left'
                                                }`}
                                        >
                                            {formatTime(message.created_at)}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))
            )}
            <div ref={messagesEndRef} />
        </CardContent>
    );
};

export default MessageList;