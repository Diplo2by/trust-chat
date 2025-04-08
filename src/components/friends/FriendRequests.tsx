import React from 'react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Check, X } from 'lucide-react';

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
        return <div className="flex items-center justify-center h-full py-8 text-emerald-600">Loading requests...</div>;
    }

    if (requests.length === 0) {
        return (
            <div className="flex items-center justify-center h-full py-8 text-emerald-600">
                You don't have any friend requests
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto bg-white">
            {requests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 border-b border-emerald-100">
                    <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-3">
                            <AvatarFallback className="bg-emerald-200 text-emerald-800">
                                {request.sender_email[0].toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-medium text-emerald-900">{request.sender_email}</p>
                            <p className="text-xs text-emerald-600">
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
                            <Check size={16} className="mr-1" />
                            Accept
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            onClick={() => onDecline(request.id)}
                        >
                            <X size={16} className="mr-1" />
                            Decline
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FriendRequests;