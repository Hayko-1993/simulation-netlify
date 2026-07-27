const { supabase } = require('./_shared/supabase')
const { cors, verifyAdmin } = require('./_shared/auth')

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return cors({})
  if (!verifyAdmin(event)) return cors({ error: 'Unauthorized' }, 401)

  const id = event.path.split('/').find((_, i, arr) => arr[i - 1] === 'carriers') ||
    (event.queryStringParameters && event.queryStringParameters.id)
  const { status } = JSON.parse(event.body || '{}')

  if (!['pending', 'approved', 'rejected'].includes(status)) return cors({ error: 'Invalid status' }, 400)
  await supabase.from('carriers').update({ status }).eq('id', id)
  return cors({ ok: true })
}
