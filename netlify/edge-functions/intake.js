import intakeWorker from '../../telegram-intake-worker/src/index.js';

export default function handler(request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get('mode');
  url.pathname = mode === 'webhook' ? '/telegram-webhook' : mode === 'health' ? '/health' : '/submit';
  const rewrittenRequest = new Request(url.toString(), request);
  return intakeWorker.fetch(rewrittenRequest, {
    ALLOWED_ORIGINS: Netlify.env.get('ALLOWED_ORIGINS') || new URL(request.url).origin,
    TELEGRAM_BOT_TOKEN: Netlify.env.get('TELEGRAM_BOT_TOKEN'),
    TELEGRAM_CHAT_ID: Netlify.env.get('TELEGRAM_CHAT_ID'),
    TELEGRAM_WEBHOOK_SECRET: Netlify.env.get('TELEGRAM_WEBHOOK_SECRET')
  });
}
