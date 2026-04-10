import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

async function main() {
    const adminSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL, 
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const users = [
        { email: 'test1@example.com', password: 'Password123!', user_metadata: { name: 'Alice' } },
        { email: 'test2@example.com', password: 'Password123!', user_metadata: { name: 'Bob' } }
    ]

    for (const u of users) {
        const { data, error } = await adminSupabase.auth.admin.createUser({
            email: u.email,
            password: u.password,
            user_metadata: u.user_metadata,
            email_confirm: true
        })
        if (error) {
            console.log(`Failed to create ${u.email}:`, error.message)
        } else {
            console.log(`Created ${u.email}`)
        }
    }
}
main()
