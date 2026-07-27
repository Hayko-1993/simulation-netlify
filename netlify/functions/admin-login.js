const { cors, ADMIN_EMAIL, ADMIN_PASSWORD, signAdminToken } = require('./_shared/auth')

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return cors({})
  const { email, password } = JSON.parse(event.body || '{}')
  if (!email || !password) return cors({ error: 'Email and password are required.' }, 400)
  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) return cors({ error: 'Invalid email or password.' }, 401)
  return cors({ token: signAdminToken() })
}
