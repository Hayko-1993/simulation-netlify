const { supabase } = require('./_shared/supabase')
const { cors, signCarrierToken } = require('./_shared/auth')
const crypto = require('crypto')

const CARRIER_TOKEN_SECRET = process.env.CARRIER_TOKEN_SECRET || 's3cr3t-carrier-tok3n-abc123'

function verifyCarrierToken(token, carrierId) {
  if (!token) return false
  const hmac = crypto.createHmac('sha256', CARRIER_TOKEN_SECRET).update(String(carrierId)).digest('hex')
  return token === `${carrierId}.${hmac}`
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return cors({})
  const id = event.path.split('/').pop()
  const token = event.queryStringParameters && event.queryStringParameters.token
  if (!verifyCarrierToken(token, id)) return cors({ error: 'Unauthorized' }, 401)

  const { data: row } = await supabase.from('carriers').select('*').eq('id', id).single()
  if (!row) return cors({ error: 'Not found' }, 404)

  const { password_hash, ...carrier } = row
  carrier.equipment = JSON.parse(carrier.equipment || '[]')
  carrier.preferred_lanes = JSON.parse(carrier.preferred_lanes || '[]')
  return cors(carrier)
}
