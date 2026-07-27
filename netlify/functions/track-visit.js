const { sendTelegram } = require('./_shared/telegram')
const { supabase } = require('./_shared/supabase')
const { cors, getIp } = require('./_shared/auth')

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return cors({})
  const { page, referrer } = JSON.parse(event.body || '{}')
  const ip = getIp(event)
  await supabase.from('visits').insert({ page: page || 'carrier-login', referrer: referrer || '', ip_address: ip })
  await sendTelegram(`👁 <b>Page Visited</b>\n📄 Page: ${page || 'carrier-login'}\n🌐 IP: ${ip}\n🔗 Referrer: ${referrer || 'direct'}`)
  return cors({ ok: true })
}
