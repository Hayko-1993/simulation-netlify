const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://muouuswlmwmmbifeegnx.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

function assertSupabaseConfigured() {
  if (!SUPABASE_SERVICE_KEY) {
    throw new Error('SUPABASE_SERVICE_KEY is not set in Netlify environment variables.')
  }
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY || 'missing-service-key')

module.exports = { supabase, assertSupabaseConfigured, SUPABASE_URL }
