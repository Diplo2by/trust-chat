import React, { useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Search } from 'lucide-react';

interface AddFriendProps {
    onSendRequest: (email: string) => Promise<{ success: boolean; message: string }>;
}

const AddFriend: React.FC<AddFriendProps> = ({ onSendRequest }) => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<{ type: 'success' | 'error' | ''; message: string }>({
        type: '',
        message: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        setIsLoading(true);
        try {
            const result = await onSendRequest(email.trim());
            setStatus({
                type: result.success ? 'success' : 'error',
                message: result.message
            });

            if (result.success) {
                setEmail('');
            }
        } catch (error) {
            setStatus({
                type: 'error',
                message: 'Failed to send friend request. Please try again.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex space-x-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-emerald-500" />
                        <Input
                            type="email"
                            placeholder="Friend's email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-8 placeholder:text-white"
                            disabled={isLoading}
                        />
                    </div>
                    <Button
                        type="submit"
                        className="bg-emerald-600 disabled:bg-black hover:scale-105 hover:bg-emerald-500"
                        disabled={!email.trim() || isLoading}
                    >
                        {isLoading ? 'Sending...' : 'Send Request'}
                    </Button>
                </div>

                {status.type && (
                    <div className={`text-sm p-2 rounded ${status.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                        {status.message}
                    </div>
                )}

                <div className="text-xs text-emerald-50">
                    Send a friend request to start chatting. They'll need to accept your request.
                </div>
            </form>
        </div>
    );
};

export default AddFriend;