import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest, adminSupabase } from '@/lib/auth-helper'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    const user = await getUserFromRequest(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { name } = await req.json()

    const { data: folder, error } = await adminSupabase
        .from('folders')
        .update({ name: name.trim() })
        .eq('id', params.id)
        .eq('owner_id', user.id)
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ folder })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const user = await getUserFromRequest(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Unlink notes from this folder so they move to root
    await adminSupabase
        .from('notes')
        .update({ folder_id: null })
        .eq('folder_id', params.id)
        .eq('owner_id', user.id)

    const { error } = await adminSupabase
        .from('folders')
        .delete()
        .eq('id', params.id)
        .eq('owner_id', user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
}
