import { createAdminClient } from '@/lib/supabase/admin'
import { normalizeAndHashPhone } from '@/actions/user/hash_phone'
import { sendEmail } from '@/actions/emails'

export async function POST(request: Request) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL
  if (!baseUrl) {
    console.error('NEXT_PUBLIC_APP_URL is not configured')
    return Response.json({ error: 'Server configuration error' }, { status: 500 })
  }

  let email: string
  let phone: string

  try {
    const body = await request.json()
    email = body.email
    phone = body.phone

    if (!email || !phone) {
      return Response.json({ success: true })
    }
  } catch {
    return Response.json({ success: true })
  }

  let hash: string
  try {
    const result = normalizeAndHashPhone(phone)
    if (!result.isValid) {
      return Response.json({ success: true })
    }
    hash = result.hash
  } catch {
    return Response.json({ success: true })
  }

  const supabase = createAdminClient()

  const { data: ad, error } = await supabase
    .from('ads')
    .select('id, title, management_token')
    .eq('email', email)
    .eq('phone_hash', hash)
    .neq('status', 'deleted')

  if (error && error.code !== 'PGRST116') {
    console.error('Database error in recover-magic-link:', error)
  }

  if (ad && ad.length > 0) {
    try {
      await sendEmail({
        to: email,
        type: 'magic_link',
        props: {
          ads: ad,
          baseUrl,
        },
      })
    } catch (emailError) {
      console.error('Failed to send recovery email:', emailError)
    }
  }

  return Response.json({ success: true })
}
