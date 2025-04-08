import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { error, trace } from '@tauri-apps/plugin-log';

interface User {
    id: string;
    email: string;
}

export const useUsers = (session: any) => {
    const [users, setUsers] = useState<User[]>([]);

    const fetchUsers = useCallback(async () => {
        if (!session) return;

        try {
            const { data, error: supabaseError } = await supabase
                .from('users')
                .select('id, email')
                .neq('id', session.user.id);

            if (supabaseError) {
                trace(supabaseError.message);
                throw supabaseError;
            }
            setUsers(data || []);
        } catch (err: any) {
            error('Error fetching users:', err);
        }
    }, [session]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    return { users };
};