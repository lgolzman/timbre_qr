// api/telegram.js
// Webhook que recibe los comandos del bot de Telegram
// Comandos soportados:
//   /on  → activa el timbre
//   /off → desactiva el timbre
//   /estado → muestra el estado actual

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).send('OK');
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const allowedChatId = process.env.TELEGRAM_CHAT_ID;

  const update = req.body;
  const message = update?.message;

  if (!message) return res.status(200).json({ ok: true });

  const chatId = String(message.chat?.id);
  const text = message.text || '';

  // Seguridad: solo aceptar comandos del chat autorizado
  if (chatId !== allowedChatId) {
    console.log(`Mensaje ignorado de chat no autorizado: ${chatId}`);
    return res.status(200).json({ ok: true });
  }

  let replyText = '';

  if (text.startsWith('/on')) {
    await setActiveState(true);
    replyText = '✅ *Timbre activado*\nLa página está visible y los avisos llegarán normalmente.';
  } else if (text.startsWith('/off')) {
    await setActiveState(false);
    replyText = '🌙 *Timbre desactivado*\nLa página mostrará "No disponible". No recibirás avisos.';
  } else if (text.startsWith('/estado') || text.startsWith('/status')) {
    const active = await getActiveState();
    replyText = active
      ? '✅ El timbre está *activo*.'
      : '🌙 El timbre está *desactivado*.';
  } else if (text.startsWith('/ayuda') || text.startsWith('/help') || text.startsWith('/start')) {
    replyText = `🔔 *Timbre Digital - Comandos*\n\n/on → Activar el timbre\n/off → Desactivar el timbre\n/estado → Ver estado actual`;
  } else {
    replyText = 'Comando no reconocido. Usá /ayuda para ver los comandos disponibles.';
  }

  // Responder al usuario
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: replyText,
      parse_mode: 'Markdown'
    })
  });

  return res.status(200).json({ ok: true });
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

async function setActiveState(active) {
  try {
    const { Redis } = await import('@upstash/redis');
    const redis = Redis.fromEnv();
    await redis.set('timbre:active', active);
  } catch(e) {
    console.error('Error escribiendo en Redis:', e);
  }
}
