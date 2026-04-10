import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest, adminSupabase } from '@/lib/auth-helper'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const user = await getUserFromRequest(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: permissions, error } = await adminSupabase
        .from('permissions')
        .select('*')
        .eq('note_id', params.id)
        .order('created_at', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const userIds = permissions.map(p => p.user_id)
    const { data: profiles } = await adminSupabase
        .from('profiles')
        .select('id, name, email, avatar_url')
        .in('id', userIds)

    const populated = permissions.map(p => ({
        ...p,
        profiles: profiles?.find(profile => profile.id === p.user_id) || null
    }))

    return NextResponse.json({ permissions: populated })
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const user = await getUserFromRequest(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Only note owner can share
    const { data: note } = await adminSupabase
        .from('notes').select('owner_id').eq('id', params.id).single()
    if (!note || note.owner_id !== user.id)
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { email, role } = await req.json()
    if (!email || !role) return NextResponse.json({ error: 'Email and role required' }, { status: 400 })

    // Find user by email
    const { data: profile } = await adminSupabase
        .from('profiles').select('id, name, email, avatar_url').eq('email', email).single()
    if (!profile) return NextResponse.json({ error: 'User not found with that email' }, { status: 404 })

    // Upsert permission
    const { data: permission, error } = await adminSupabase
        .from('permissions')
        .upsert({ note_id: params.id, user_id: profile.id, role }, { onConflict: 'note_id,user_id' })
        .select('*')
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    
    // Attach profile manually
    const populated = { ...permission, profiles: profile }
    
    return NextResponse.json({ permission: populated })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const user = await getUserFromRequest(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: note } = await adminSupabase
        .from('notes').select('owner_id').eq('id', params.id).single()
    if (!note || note.owner_id !== user.id)
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { permissionId } = await req.json()
    const { error } = await adminSupabase
        .from('permissions').delete().eq('id', permissionId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
}
