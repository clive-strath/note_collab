import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest, adminSupabase } from '@/lib/auth-helper'

export async function GET(req: NextRequest) {
    const user = await getUserFromRequest(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: folders, error } = await adminSupabase
        .from('folders')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ folders })
}

export async function POST(req: NextRequest) {
    const user = await getUserFromRequest(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { name } = await req.json()
    if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 })

    const { data: folder, error } = await adminSupabase
        .from('folders')
        .insert({ name: name.trim(), owner_id: user.id })
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ folder })
}
