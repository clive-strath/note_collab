import { NextRequest, NextResponse } from 'next/server'
import { adminSupabase } from '@/lib/auth-helper'

export async function GET(req: NextRequest) {
    const users = [
        { email: 'test1@example.com', password: 'Password123!', user_metadata: { name: 'Alice' } },
        { email: 'test2@example.com', password: 'Password123!', user_metadata: { name: 'Bob' } }
    ]

    const results = []
    for (const u of users) {
        const { data, error } = await adminSupabase.auth.admin.createUser({
            email: u.email,
            password: u.password,
            user_metadata: u.user_metadata,
            email_confirm: true
        })
        if (error) {
            results.push(`Failed to create ${u.email}: ` + error.message)
        } else {
            results.push(`Created ${u.email}`)
        }
    }
    return NextResponse.json({ results })
}
