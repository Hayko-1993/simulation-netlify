const crypto = require('crypto')

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'Remy'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '465385AUA'
const ADMIN_TOKEN_SECRET = process.env.ADMIN_TOKEN_SECRET || 's3cr3t-admin-tok3n-xyz987'
const CARRIER_TOKEN_SECRET = process.env.CARRIER_TOKEN_SECRET || 's3cr3t-carrier-tok3n-abc123'

function signAdminToken() {
  return crypto.createHmac('sha256', ADMIN_TOKEN_SECRET).update(ADMIN_EMAIL).digest('hex')
}

function verifyAdmin(event) {
  const token = (event.headers && (event.headers['x-admin-key'] || event.headers['X-Admin-Key'])) ||
    (event.queryStringParameters && event.queryStringParameters.key)
  return token && token === signAdminToken()
}

function signCarrierToken(carrierId) {
  const hmac = crypto.createHmac('sha256', CARRIER_TOKEN_SECRET).update(String(carrierId)).digest('hex')
  return `${carrierId}.${hmac}`
}

function generateCode() {
  return String(crypto.randomInt(0, 1000000)).padStart(6, '0')
}

function cors(body, statusCode = 200) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, x-admin-key',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    },
    body: JSON.stringify(body),
  }
}

function getIp(event) {
  return (
    (event.headers && (event.headers['x-forwarded-for'] || event.headers['client-ip'])) || ''
  ).split(',')[0].trim()
}

module.exports = { ADMIN_EMAIL, ADMIN_PASSWORD, signAdminToken, verifyAdmin, signCarrierToken, generateCode, cors, getIp }
