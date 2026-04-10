'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface AuthContextType {
    user: User | null
    session: Session | null
    loading: boolean
    signIn: (email: string, password: string) => Promise<{ error: string | null }>
    signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>
    signInWithGoogle: () => Promise<{ error: string | null }>
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
    signIn: async () => ({ error: null }),
    signUp: async () => ({ error: null }),
    signInWithGoogle: async () => ({ error: null }),
    signOut: async () => { },
})

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const handleSession = (session: Session | null) => {
            setSession(session)
            setUser(session?.user ?? null)
            setLoading(false)
            if (session) {
                document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=31536000; SameSite=Lax`
            } else {
                document.cookie = `sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
            }
        }

        supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (!session && process.env.NODE_ENV === 'development') {
                // Auto-provision a local test user since Login UI is deferred for future
                console.log("No session found. Auto-logging in for local dev...")
                const email = 'localdev@example.com'
                const password = 'LocalDevPassword123!'
                let res = await supabase.auth.signInWithPassword({ email, password })
                if (res.error) {
                    res = await supabase.auth.signUp({ email, password, options: { data: { name: 'Dev User' } } })
                }
                handleSession(res.data.session)
            } else {
                handleSession(session)
            }
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            handleSession(session)
        })

        return () => subscription.unsubscribe()
    }, [])

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) return { error: error.message }
        router.push('/')
        return { error: null }
    }

    const signUp = async (email: string, password: string, name: string) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { name } },
        })
        if (error) return { error: error.message }
        return { error: null }
    }

    const signInWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${window.location.origin}/` },
        })
        if (error) return { error: error.message }
        return { error: null }
    }

    const signOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signInWithGoogle, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}
