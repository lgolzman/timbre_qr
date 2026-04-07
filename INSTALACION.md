# 🔔 Timbre Digital con QR — Guía de instalación

## Qué vas a tener al final

- Una página web con un botón "Tocar timbre"
- Cuando alguien lo aprieta, te llega un mensaje a Telegram con lo que escribió
- Desde Telegram podés poner `/off` para desactivarlo y `/on` para activarlo
- Un QR que apunta a esa página para pegar en la puerta

---

## Paso 1: Crear el Bot de Telegram

1. Abrí Telegram y buscá **@BotFather**
2. Mandale el mensaje: `/newbot`
3. Te va a pedir un nombre para el bot (ej: `Timbre de mi casa`)
4. Te va a pedir un username que termine en `bot` (ej: `timbre_mi_casa_bot`)
5. Te va a dar un **token** que se ve así: `123456789:AABBccDDeeFfGGhhIIjjKKllMMnnOOppQQ`
6. **Guardá ese token**, lo vas a necesitar

---

## Paso 2: Obtener tu Chat ID de Telegram

1. Buscá tu bot en Telegram por el username que elegiste
2. Mandале cualquier mensaje (ej: `/start`)
3. Abrí este link en el navegador (reemplazá TU_TOKEN):
   ```
   https://api.telegram.org/botTU_TOKEN/getUpdates
   ```
4. Buscá en la respuesta el campo `"id"` dentro de `"chat"` — ese número es tu **Chat ID**
5. Guardalo también

---

## Paso 3: Subir el código a GitHub

1. Creá una cuenta en [github.com](https://github.com) si no tenés
2. Creá un repositorio nuevo (ej: `timbre-qr`), que sea privado
3. Subí todos los archivos de esta carpeta al repositorio

   Si tenés Git instalado:
   ```bash
   cd timbre-qr
   git init
   git add .
   git commit -m "Timbre inicial"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/timbre-qr.git
   git push -u origin main
   ```

---

## Paso 4: Deployar en Vercel

1. Entrá a [vercel.com](https://vercel.com) y creá una cuenta gratis (podés entrar con GitHub)
2. Hacé clic en **"Add New Project"**
3. Importá el repositorio `timbre-qr` de tu GitHub
4. Antes de deployar, en la sección **"Environment Variables"** agregá:

   | Variable | Valor |
   |----------|-------|
   | `TELEGRAM_BOT_TOKEN` | El token del Paso 1 |
   | `TELEGRAM_CHAT_ID` | Tu Chat ID del Paso 2 |

5. Hacé clic en **Deploy**
6. En unos segundos vas a tener una URL tipo `timbre-qr.vercel.app`

---

## Paso 5: Configurar el Webhook de Telegram

Para que Telegram le avise a tu app cuando mandás `/on` o `/off`, ejecutá este comando (reemplazá los valores):

```
https://api.telegram.org/botTU_TOKEN/setWebhook?url=https://TU_URL.vercel.app/api/telegram
```

Abrilo en el navegador. Deberías ver: `{"ok":true,"result":true}`

---

## Paso 6 (Opcional pero recomendado): Activar Vercel KV

Sin esto, el `/on` y `/off` funcionan pero no persisten si Vercel reinicia el servidor. Para que sea permanente:

1. En el panel de Vercel, andá a **Storage** → **Create Database** → **KV**
2. Dale un nombre (ej: `timbre-kv`)
3. Conectala al proyecto `timbre-qr`
4. Vercel agrega automáticamente las variables `KV_REST_API_URL` y `KV_REST_API_TOKEN`
5. Listo — ahora el estado persiste

---

## Paso 7: Generar el QR

1. Entrá a [qr.io](https://qr.io) o [qrcode-monkey.com](https://www.qrcode-monkey.com)
2. Pegá tu URL de Vercel (ej: `https://timbre-qr.vercel.app`)
3. Descargá el QR en alta resolución
4. Imprimilo y pegalo en la puerta

---

## Uso diario desde Telegram

Una vez todo configurado, en tu bot de Telegram podés usar:

- `/on` → Activar el timbre
- `/off` → Desactivar el timbre (modo no molestar)
- `/estado` → Ver si está activo o no
- `/ayuda` → Ver todos los comandos

---

## Resumen de archivos

```
timbre-qr/
├── public/
│   └── index.html     ← La página que ve el visitante
├── api/
│   ├── status.js      ← Devuelve si el timbre está activo
│   ├── ring.js        ← Manda el mensaje a Telegram
│   └── telegram.js    ← Recibe los comandos /on y /off
├── vercel.json        ← Configuración de Vercel
└── package.json
```
