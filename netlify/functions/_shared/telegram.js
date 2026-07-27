const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN || '8507772040:AAFaSLszhTcCSJ6DKDcsOFCxSKYgLDSqECE'
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '603922771'

async function sendTelegram(message) {
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: 'HTML' }),
    })
  } catch (e) {
    console.error('Telegram error:', e)
  }
}

module.exports = { sendTelegram }
