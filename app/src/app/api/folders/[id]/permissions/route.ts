import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest, adminSupabase } from '@/lib/auth-helper'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const user = await getUserFromRequest(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: permissions, error } = await adminSupabase
        .from('folder_permissions')
        .select('*')
        .eq('folder_id', params.id)
        .order('created_at', { ascending: true })

    if (error) {
        if (error.code === '42P01') {
           // relation "folder_permissions" does not exist (fallback for kidnapped DB admin error)
           return NextResponse.json({ permissions: [] })
        }
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

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

    // Only folder owner can share
    const { data: folder } = await adminSupabase
        .from('folders').select('owner_id').eq('id', params.id).single()
    if (!folder || folder.owner_id !== user.id)
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { email, role } = await req.json()
    if (!email || !role) return NextResponse.json({ error: 'Email and role required' }, { status: 400 })

    const { data: profile } = await adminSupabase
        .from('profiles').select('id, name, email, avatar_url').eq('email', email).single()
    if (!profile) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const { data: permission, error } = await adminSupabase
        .from('folder_permissions')
        .upsert({ folder_id: params.id, user_id: profile.id, role }, { onConflict: 'folder_id,user_id' })
        .select('*')
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    
    return NextResponse.json({ permission: { ...permission, profiles: profile } })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const user = await getUserFromRequest(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: folder } = await adminSupabase
        .from('folders').select('owner_id').eq('id', params.id).single()
    if (!folder || folder.owner_id !== user.id)
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { permissionId } = await req.json()
    const { error } = await adminSupabase
        .from('folder_permissions').delete().eq('id', permissionId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
}
