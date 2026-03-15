import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { email, name, university, graduationYear, gpa, fieldOfStudy, eligible } = body

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
  }

  if (!supabase) {
    // Supabase not configured — log and return success so UX is not broken
    console.warn('Supabase not configured, lead not stored:', { email })
    return NextResponse.json({ success: true, warning: 'Lead storage not configured' })
  }

  const { error } = await supabase.from('leads').insert({
    email,
    name: name ?? null,
    university: university ?? null,
    graduation_year: graduationYear ?? null,
    gpa: gpa ?? null,
    field_of_study: fieldOfStudy ?? null,
    eligible: eligible ?? null,
    created_at: new Date().toISOString(),
  })

  if (error) {
    console.error('Supabase insert error:', error)
    return NextResponse.json({ error: 'Failed to save lead' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
