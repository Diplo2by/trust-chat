import React from 'react';
import { CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { MessageCircle, LogOut } from 'lucide-react';

interface ChatHeaderProps {
    userEmail: string;
    onLogout: () => void;
    children?: React.ReactNode;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ userEmail, onLogout, children }) => {
    return (
        <CardHeader className="bg-emerald-700 text-white p-4 flex items-center justify-between shadow-md border-b border-emerald-800">
            <div className="flex items-center space-x-3">
                <MessageCircle size={24} className="text-white" />
                <h1 className="text-xl font-semibold">Trust Chat</h1>
            </div>
            <div className="flex items-center space-x-4">
                <div className="text-sm text-emerald-100">
                    {userEmail.split('@')[0]}
                </div>
                {children}
                <Button
                    onClick={onLogout}
                    variant="destructive"
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white"
                >
                    <LogOut size={16} className="mr-2" /> Logout
                </Button>
            </div>
        </CardHeader>
    );
};

export default ChatHeader;