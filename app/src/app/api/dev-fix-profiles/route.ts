import { NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/auth-helper'

export async function GET() {
    const { data: users, error: authError } = await adminSupabase.auth.admin.listUsers()
    if (authError) return NextResponse.json({ error: authError.message })

    const results = []
    
    for (const u of users.users) {
        // Upsert into profiles
        const { error: profileError } = await adminSupabase
            .from('profiles')
            .upsert({
                id: u.id,
                email: u.email,
                name: u.user_metadata?.name || u.email?.split('@')[0],
                avatar_url: u.user_metadata?.avatar_url || ''
            })
            
        if (profileError) {
            results.push(`Failed to sync profile for ${u.email}: ${profileError.message}`)
        } else {
            results.push(`Successfully synced profile for ${u.email}`)
        }
    }
    
    return NextResponse.json({ results })
}
