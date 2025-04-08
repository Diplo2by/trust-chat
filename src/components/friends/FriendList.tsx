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
        return <div className="flex items-center justify-center h-full py-8 text-emerald-600">Loading friends...</div>;
    }

    if (friends.length === 0) {
        return (
            <div className="flex items-center justify-center h-full py-8 text-emerald-600">
                You don't have any friends yet. Add some friends to start chatting!
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto bg-white">
            {friends.map((friend) => (
                <div
                    key={friend.id}
                    className={`flex items-center p-4 cursor-pointer transition-colors ${selectedRecipient === friend.id
                            ? 'bg-emerald-100 border-l-4 border-emerald-600'
                            : 'hover:bg-emerald-50 border-l-4 border-transparent'
                        }`}
                    onClick={() => onSelectRecipient(friend.id)}
                >
                    <Avatar className="h-10 w-10 mr-3">
                        <AvatarFallback className="bg-emerald-200 text-emerald-800">
                            {friend.email[0].toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-emerald-900">
                            {friend.email}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FriendsList;