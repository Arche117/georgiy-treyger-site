import intakeWorker from '../telegram-intake-worker/src/index.js';

export const config = { runtime: 'edge' };

export default function handler(request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get('mode');
  url.pathname = mode === 'webhook'
    ? '/telegram-webhook'
    : mode === 'health'
      ? '/health'
      : '/submit';

  const rewrittenRequest = new Request(url.toString(), request);
  return intakeWorker.fetch(rewrittenRequest, {
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
    TELEGRAM_WEBHOOK_SECRET: process.env.TELEGRAM_WEBHOOK_SECRET
  });
}
