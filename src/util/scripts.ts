import { Message } from "@/context/ChatContext";

export const formatTime = (timestamp: string) => {
    try {
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) return '';

        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        }).replace(/AM|PM/g, "");
    } catch (error) {
        return '';
    }
};

export
    const formatDate = (timestamp: string) => {
        try {
            const date = new Date(timestamp);
            if (isNaN(date.getTime())) return '';

            // Today, Yesterday, or date
            const today = new Date();
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            if (date.toDateString() === today.toDateString()) {
                return 'Today';
            } else if (date.toDateString() === yesterday.toDateString()) {
                return 'Yesterday';
            } else {
                return date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: today.getFullYear() !== date.getFullYear() ? 'numeric' : undefined
                });
            }
        } catch (error) {
            return '';
        }
    };

export const groupMessagesByDate = (messages: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = [];

    messages.forEach((message) => {
        const messageDate = new Date(message.created_at).toDateString();
        const existingGroup = groups.find(group => {
            const firstMessageDate = new Date(group.messages[0].created_at).toDateString();
            return firstMessageDate === messageDate;
        });

        if (existingGroup) {
            existingGroup.messages.push(message);
        } else {
            groups.push({
                date: formatDate(message.created_at),
                messages: [message]
            });
        }
    });

    return groups;
};