import React from 'react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { trace } from '@tauri-apps/plugin-log'

interface FriendRequest {
    id: string;
    sender_id: string;
    sender_email: string;
    created_at: string;
}

interface FriendRequestsProps {
    requests: FriendRequest[];
    onAccept: (requestId: string) => Promise<void>;
    onDecline: (requestId: string) => Promise<void>;
    isLoading: boolean;
}

const FriendRequests: React.FC<FriendRequestsProps> = ({
    requests,
    onAccept,
    onDecline,
    isLoading
}) => {
    if (isLoading) {
        return <div className="text-center p-4 text-emerald-700">Loading requests...</div>;
    }

    if (requests.length === 0) {
        return (
            <div className="text-center p-4 text-emerald-50">
                You don't have any friend requests
            </div>
        );
    }


    return (
        <div className="max-h-64 overflow-y-auto">
            {requests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 border-b border-gray-100">
                    <div className="flex items-center">
                        <Avatar className="h-8 w-8 mr-2">
                            <AvatarFallback className="bg-emerald-200 text-emerald-800">
                                {request.sender_email[0].toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-sm font-medium">{request.sender_email}</p>
                            <p className="text-xs text-gray-500">
                                {new Date(request.created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-emerald-500 text-emerald-700 hover:bg-emerald-50"
                            onClick={() => onAccept(request.id)}
                        >
                            Accept
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-300 text-gray-700 hover:bg-gray-50"
                            onClick={() => onDecline(request.id)}
                        >
                            Decline
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FriendRequests;