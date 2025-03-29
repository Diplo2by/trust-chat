import React, { useRef, useEffect } from 'react';
import { CardContent } from '../ui/card';

interface Message {
    id: number;
    content: string;
    user_id: string;
    recipient_id: string;
    created_at: string;
}

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

    return (
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
                messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex flex-col ${message.user_id === currentUserId
                            ? 'items-end'
                            : 'items-start'
                            }`}
                    >
                        <div
                            className={`max-w-[70%] p-3 rounded-lg mb-2 shadow-sm ${message.user_id === currentUserId
                                ? 'bg-emerald-700 text-white'
                                : 'bg-emerald-100 text-emerald-900'
                                }`}
                        >
                            {message.content}
                        </div>
                    </div>
                ))
            )}
            <div ref={messagesEndRef} />
        </CardContent>
    );
};

export default MessageList;