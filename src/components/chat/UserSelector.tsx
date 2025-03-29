import React from 'react';
import { Users } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface User {
    id: string;
    email: string;
}

interface UserSelectorProps {
    users: User[];
    selectedRecipient: string;
    onSelectRecipient: (userId: string) => void;
}

const UserSelector: React.FC<UserSelectorProps> = ({
    users,
    selectedRecipient,
    onSelectRecipient
}) => {
    return (
        <Select
            value={selectedRecipient}
            onValueChange={onSelectRecipient}
        >
            <SelectTrigger className="w-1/2 bg-red-50 text-emerald-900">
                <Users size={16} className="mr-2" />
                <SelectValue placeholder="Select User" />
            </SelectTrigger>
            <SelectContent>
                {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                        {user.email}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};

export default UserSelector;