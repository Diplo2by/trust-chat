import React, { useRef, useEffect } from 'react';
import { CardContent } from '../ui/card';
import { formatTime, groupMessagesByDate } from '@/util/scripts';
import { Message } from '@/context/ChatContext';

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

    // Scroll to bottom when messages change
    useEffect(() => {
        const timer = setTimeout(() => {
            if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
            }
        }, 100);
        return () => clearTimeout(timer);
    }, [messages]);

    const messageGroups = groupMessagesByDate(messages)

    return (
        <CardContent
            ref={messagesContainerRef}
            className="flex-grow overflow-y-auto p-6 space-y-4 bg-white"
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
                messageGroups.map((group, groupIndex) => (
                    <div key={groupIndex} className="space-y-3">
                        <div className="flex justify-center">
                            <div className="bg-emerald-50 text-emerald-800 text-xs font-medium px-3 py-1 rounded-full">
                                {group.date}
                            </div>
                        </div>

                        {group.messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex flex-col ${message.user_id === currentUserId
                                    ? 'items-end'
                                    : 'items-start'
                                    }`}
                            >
                                <div className={` flex flex-col  ${message.user_id === currentUserId ? " items-end" : ""}`}>
                                    <div
                                        className={` p-3 pb-3 mb-1 rounded-lg  shadow-sm ${message.user_id === currentUserId
                                            ? 'bg-emerald-700 text-white'
                                            : 'bg-emerald-100 text-emerald-900'
                                            }`}
                                    >
                                        {message.content}
                                    </div>
                                    <div
                                        className={` text-[0.7rem] text-gray-800
                                            }`}
                                    >
                                        {formatTime(message.created_at)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ))
            )}
            <div ref={messagesEndRef} />
        </CardContent>
    );
};

export default MessageList;