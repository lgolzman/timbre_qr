// api/status.js
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const active = await getActiveState();
  res.status(200).json({ active });
}

export async function getActiveState() {
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
