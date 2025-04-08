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
        <div className="p-4 h-full bg-white">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex space-x-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-emerald-600" />
                        <Input
                            type="email"
                            placeholder="Friend's email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10 border-emerald-200 focus:border-emerald-500"
                            disabled={isLoading}
                        />
                    </div>
                    <Button
                        type="submit"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        disabled={!email.trim() || isLoading}
                    >
                        {isLoading ? 'Sending...' : 'Send'}
                    </Button>
                </div>

                {status.type && (
                    <div className={`text-sm p-3 rounded ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                        {status.message}
                    </div>
                )}

                <div className="text-sm text-emerald-700">
                    Send a friend request to start chatting. They'll need to accept your request.
                </div>
            </form>
        </div>
    );
};

export default AddFriend;
