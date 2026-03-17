import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest, adminSupabase } from '@/lib/auth-helper'

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string; commentId: string } }
) {
    const user = await getUserFromRequest(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { error } = await adminSupabase
        .from('comments')
        .delete()
        .eq('id', params.commentId)
        .eq('author_id', user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
}
