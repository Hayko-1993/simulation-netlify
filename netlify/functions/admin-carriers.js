const { supabase } = require('./_shared/supabase')
const { cors, verifyAdmin } = require('./_shared/auth')

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return cors({})
  if (!verifyAdmin(event)) return cors({ error: 'Unauthorized' }, 401)

  const { data } = await supabase.from('carriers').select('*').order('created_at', { ascending: false })
  const rows = (data || []).map(({ password_hash, ...r }) => ({
    ...r,
    equipment: JSON.parse(r.equipment || '[]'),
    preferred_lanes: JSON.parse(r.preferred_lanes || '[]'),
  }))
  return cors(rows)
}
