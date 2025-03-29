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
            className="p-6 bg-emerald-50 border-t border-emerald-200 flex items-center space-x-4"
        >
            <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Type your message..."
                disabled={disabled}
                className="flex-grow border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
            />
            <Button
                type="submit"
                disabled={value.trim() === '' || disabled}
                className="bg-emerald-700 text-white hover:bg-emerald-600 transition-colors duration-300 px-4"
            >
                <Send size={20} className="mr-2" /> Send
            </Button>
        </form>
    );
};

export default MessageInput;