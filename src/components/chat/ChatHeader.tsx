import React from 'react';
import { CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { MessageCircle, LogOut } from 'lucide-react';

interface ChatHeaderProps {
    userEmail: string;
    onLogout: () => void;
    children: React.ReactNode;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ userEmail, onLogout, children }) => {
    return (
        <CardHeader className="bg-emerald-800 text-white py-4 px-6 flex flex-row items-center justify-between">
            <div className="flex items-center space-x-3">
                <MessageCircle size={24} className="text-white" />
                <CardTitle className="text-xl font-semibold">Trust Chat</CardTitle>
            </div>
            <div className="flex items-center space-x-4">
                <div className="text-sm text-emerald-200">
                    Logged in as: {userEmail.split('@')[0]}
                </div>
                {children}
                <Button
                    onClick={onLogout}
                    variant="destructive"
                    className="bg-red-600 hover:bg-red-700 text-white"
                >
                    <LogOut size={16} className="mr-2" /> Logout
                </Button>
            </div>
        </CardHeader>
    );
};

export default ChatHeader;