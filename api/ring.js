// api/ring.js
// Cuando alguien toca el timbre, manda mensaje a Telegram

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  // Verificar que el timbre esté activo
  const active = await getActiveState();
  if (!active) {
    return res.status(403).json({ ok: false, error: 'Timbre desactivado' });
  }

  const { message, phone } = req.body || {};
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.error('Faltan variables de entorno TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID');
    return res.status(500).json({ ok: false, error: 'Configuración incompleta' });
  }

  let text = '🔔 *¡Alguien tocó el timbre!*\n\n';
  if (message) text += `💬 Mensaje: _${message}_\n`;
  if (phone) text += `📞 Teléfono: ${phone}\n`;
  if (!message && !phone) text += '_(sin mensaje)_';

  try {
    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown'
      })
    });

    const tgData = await tgRes.json();

    if (!tgData.ok) {
      console.error('Error Telegram:', tgData);
      return res.status(500).json({ ok: false, error: 'Error enviando mensaje' });
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error('Error:', e);
    return res.status(500).json({ ok: false, error: 'Error de red' });
  }
}

async function getActiveState() {
  try {
    const { Redis } = await import('@upstash/redis');
    const redis = Redis.fromEnv();
    const val = await redis.get('timbre:active');
    if (val === null) return true;
    return val === true || val === 'true';
  } catch(e) {
    console.error('Error Redis:', e);
    return true;
  }
}
