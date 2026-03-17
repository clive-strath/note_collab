import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Extracts the authenticated user from a request using the Supabase JWT.
 * The client must send the Authorization: Bearer <token> header.
 */
export async function getUserFromRequest(req: NextRequest) {
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) return null

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { global: { headers: { Authorization: `Bearer ${token}` } } }
    )

    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return null
    return user
}

/**
 * Service-role Supabase client (bypasses RLS — use only in server routes)
 */
export const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)
