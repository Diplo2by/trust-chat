import React from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Send } from 'lucide-react';

interface MessageInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    disabled: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
    value,
    onChange,
    onSubmit,
    disabled
}) => {
    return (
        <form
            onSubmit={onSubmit}
            className="p-4 bg-white border-t border-emerald-200 flex items-center space-x-3"
        >
            <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={disabled ? "Select a friend to start messaging..." : "Type your message..."}
                disabled={disabled}
                className="flex-grow border-emerald-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-300"
            />
            <Button
                type="submit"
                disabled={value.trim() === '' || disabled}
                className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
                <Send size={18} className="mr-2" /> Send
            </Button>
        </form>
    );
};

export default MessageInput;