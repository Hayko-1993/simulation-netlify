const bcrypt = require('bcryptjs')
const { supabase } = require('./_shared/supabase')
const { cors } = require('./_shared/auth')

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return cors({})
  try {
    const body = JSON.parse(event.body || '{}')
    const required = ['companyLegalName', 'mcNumber', 'dotNumber', 'contactName', 'phone', 'email', 'password']
    for (const field of required) {
      if (!body[field] || String(body[field]).trim() === '') {
        return cors({ error: `Missing required field: ${field}` }, 400)
      }
    }

    const { data: existing } = await supabase.from('carriers').select('id').eq('email', body.email).single()
    if (existing) return cors({ error: 'An account with this email already exists.' }, 409)

    const password_hash = bcrypt.hashSync(body.password, 10)
    const { data, error } = await supabase.from('carriers').insert({
      company_legal_name: body.companyLegalName,
      mc_number: body.mcNumber,
      dot_number: body.dotNumber,
      contact_name: body.contactName,
      phone: body.phone,
      email: body.email,
      password_hash,
      equipment: JSON.stringify(Array.isArray(body.equipment) ? body.equipment : []),
      preferred_lanes: JSON.stringify(Array.isArray(body.preferredLanes) ? body.preferredLanes : []),
    }).select().single()

    if (error) throw error
    return cors({ id: data.id, message: 'Application submitted successfully.' }, 201)
  } catch (err) {
    return cors({ error: err.message || 'Something went wrong.' }, 500)
  }
}
