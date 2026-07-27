const { supabase } = require('./_shared/supabase')
const { cors } = require('./_shared/auth')

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return cors({})
  const { count } = await supabase.from('carriers').select('*', { count: 'exact', head: true }).eq('status', 'approved')
  return cors({ activeCarriers: count || 0 })
}
