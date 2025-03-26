import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../supabaseClient';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
    session: Session | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    loading: true
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_, session) => {
                setSession(session);
            }
        );

        // Cleanup subscription
        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return (
        <AuthContext.Provider value={{ session, loading }
        }>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);