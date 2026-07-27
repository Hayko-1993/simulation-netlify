const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://jhvpbcakzcukrsjecvvn.supabase.co',
  process.env.SUPABASE_SERVICE_KEY
)

module.exports = { supabase }
