import React from 'react';
import { Avatar, AvatarFallback } from '../ui/avatar';

interface Friend {
    id: string;
    email: string;
}

interface FriendsListProps {
    friends: Friend[];
    selectedRecipient: string;
    onSelectRecipient: (userId: string) => void;
    isLoading: boolean;
}

const FriendsList: React.FC<FriendsListProps> = ({
    friends,
    selectedRecipient,
    onSelectRecipient,
    isLoading
}) => {
    if (isLoading) {
        return <div className="text-center p-4 text-emerald-700">Loading friends...</div>;
    }

    if (friends.length === 0) {
        return (
            <div className="text-center p-4 text-emerald-50">
                You don't have any friends yet. Add some friends to start chatting!
            </div>
        );
    }

    return (
        <div className="max-h-64 overflow-y-auto">
            {friends.map((friend) => (
                <div
                    key={friend.id}
                    className={`flex items-center p-3 cursor-pointer hover:bg-emerald-100 ${selectedRecipient === friend.id ? 'bg-emerald-100' : ''
                        }`}
                    onClick={() => onSelectRecipient(friend.id)}
                >
                    <Avatar className="h-8 w-8 mr-2">
                        <AvatarFallback className="bg-emerald-200 text-emerald-800">
                            {friend.email[0].toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                            {friend.email}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FriendsList;