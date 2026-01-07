
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

type UserRole = 'perito' | 'pcp' | 'gestor' | null;

interface AuthContextType {
    session: Session | null;
    user: any | null;
    role: UserRole;
    loading: boolean;
    isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    role: null,
    loading: true,
    isAdmin: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [role, setRole] = useState<UserRole>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Get Session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session?.user) {
                fetchRole(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // 2. Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session?.user) {
                fetchRole(session.user.id);
            } else {
                setRole(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchRole = async (userId: string) => {
        console.log('🔍 Fetching role for user:', userId);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single();

            console.log('📊 Role query result:', { data, error });

            if (error) {
                console.error('❌ Error fetching role:', error);
            }

            if (data) {
                console.log('✅ Role loaded:', data.role);
                setRole(data.role as UserRole);
            } else {
                console.warn('⚠️ No role data found for user');
            }
        } catch (error) {
            console.error('💥 Exception fetching role:', error);
        } finally {
            setLoading(false);
        }
    };

    const value = {
        session,
        user: session?.user ?? null,
        role,
        loading,
        isAdmin: role === 'gestor' || role === 'pcp' || role === 'perito'
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
