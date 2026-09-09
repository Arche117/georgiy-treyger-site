const MAX_FILES = 6;
const MAX_FILE_SIZE = 9.5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return corsPreflight(request, env);
    if (request.method === 'GET' && url.pathname === '/health') return json({ok: true});
    if (request.method === 'GET' && url.pathname === '/setup-webhook') {
      if (!env.TELEGRAM_WEBHOOK_SECRET) return json({error: 'Service is not configured'}, 503);
      await telegram(env, 'setWebhook', {
        url: `${url.origin}/telegram-webhook`,
        secret_token: env.TELEGRAM_WEBHOOK_SECRET,
        allowed_updates: ['callback_query']
      });
      return json({ok: true});
    }
    if (request.method === 'POST' && url.pathname === '/telegram-webhook') {
      return handleTelegramWebhook(request, env);
    }
    if (request.method !== 'POST' || url.pathname !== '/submit') return json({error: 'Not found'}, 404);
    return handleSubmission(request, env);
  }
};

async function handleSubmission(request, env) {
  const origin = request.headers.get('Origin') || '';
  const headers = corsHeaders(origin, env);
  if (!isAllowedOrigin(origin, env)) return json({error: 'Origin is not allowed'}, 403, headers);
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return json({error: 'Service is not configured'}, 503, headers);

  let form;
  try { form = await request.formData(); }
  catch { return json({error: 'Некорректные данные формы'}, 400, headers); }

  if (clean(form.get('company'), 100)) return json({ok: true}, 200, headers);
  const name = clean(form.get('name'), 80);
  const contact = clean(form.get('contact'), 120);
  const message = clean(form.get('message'), 2000);
  if (!name || !contact) return json({error: 'Укажите имя и контакт'}, 400, headers);

  const photos = form.getAll('photos').filter(value => value instanceof File && value.size > 0);
  if (photos.length > MAX_FILES) return json({error: `Можно приложить не больше ${MAX_FILES} фотографий`}, 400, headers);
  for (const photo of photos) {
    if (!ALLOWED_TYPES.has(photo.type) || photo.size > MAX_FILE_SIZE) {
      return json({error: 'Допустимы JPG, PNG или WebP до 9,5 МБ'}, 400, headers);
    }
  }

  const applicationId = crypto.randomUUID().slice(0, 8).toUpperCase();
  const topicName = `🆕 ${name} · ${applicationId}`.slice(0, 128);
  let threadId;
  try {
    const topic = await telegram(env, 'createForumTopic', {chat_id: env.TELEGRAM_CHAT_ID, name: topicName});
    threadId = topic.message_thread_id;
  } catch {
    threadId = undefined;
  }

  const text = [
    `<b>Новая заявка · ${escapeHtml(applicationId)}</b>`,
    `<b>Имя:</b> ${escapeHtml(name)}`,
    `<b>Контакт:</b> ${escapeHtml(contact)}`,
    `<b>Комментарий:</b> ${escapeHtml(message || 'не указан')}`,
    `<b>Фотографий:</b> ${photos.length}`
  ].join('\n');

  const sent = await telegram(env, 'sendMessage', compact({
    chat_id: env.TELEGRAM_CHAT_ID,
    message_thread_id: threadId,
    text,
    parse_mode: 'HTML',
    reply_markup: {inline_keyboard: [[
      {text:'● Новая', callback_data:'status:new'},
      {text:'Связались', callback_data:'status:contacted'},
      {text:'Записан', callback_data:'status:booked'}
    ]]}
  }));

  for (let index = 0; index < photos.length; index += 1) {
    const payload = new FormData();
    payload.set('chat_id', env.TELEGRAM_CHAT_ID);
    if (threadId) payload.set('message_thread_id', String(threadId));
    payload.set('caption', `Заявка ${applicationId} · фото ${index + 1}/${photos.length}`);
    payload.set('photo', photos[index], safeFilename(photos[index].name, index));
    await telegramMultipart(env, 'sendPhoto', payload);
  }

  return json({ok: true, applicationId, messageId: sent.message_id}, 200, headers);
}

async function handleTelegramWebhook(request, env) {
  if (!env.TELEGRAM_WEBHOOK_SECRET || request.headers.get('X-Telegram-Bot-Api-Secret-Token') !== env.TELEGRAM_WEBHOOK_SECRET) {
    return json({error: 'Unauthorized'}, 401);
  }
  const update = await request.json();
  const query = update.callback_query;
  if (!query?.data?.startsWith('status:')) return json({ok: true});
  const status = query.data.slice(7);
  const labels = {new:'● Новая', contacted:'● Связались', booked:'● Записан'};
  const topicPrefixes = {new:'🆕', contacted:'🟡', booked:'✅'};
  const keyboard = Object.entries(labels).map(([key, label]) => ({
    text: key === status ? label : label.replace('● ', ''), callback_data: `status:${key}`
  }));
  await telegram(env, 'editMessageReplyMarkup', {
    chat_id: query.message.chat.id,
    message_id: query.message.message_id,
    reply_markup: {inline_keyboard: [keyboard]}
  });
  if (query.message.message_thread_id && topicPrefixes[status]) {
    const name = clean(query.message.text?.match(/Имя:\s*([^\n]+)/)?.[1], 80) || 'Пациент';
    const applicationId = clean(query.message.text?.match(/Новая заявка\s*·\s*([A-Z0-9]+)/)?.[1], 16) || 'Заявка';
    await telegram(env, 'editForumTopic', {
      chat_id: query.message.chat.id,
      message_thread_id: query.message.message_thread_id,
      name: `${topicPrefixes[status]} ${name} · ${applicationId}`.slice(0, 128)
    });
  }
  await telegram(env, 'answerCallbackQuery', {callback_query_id: query.id, text: `Статус: ${labels[status]?.replace('● ', '') || status}`});
  return json({ok: true});
}

async function telegram(env, method, body) {
  const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/${method}`, {
    method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body)
  });
  const result = await response.json();
  if (!result.ok) throw new Error(result.description || `Telegram ${method} failed`);
  return result.result;
}

async function telegramMultipart(env, method, body) {
  const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/${method}`, {method:'POST', body});
  const result = await response.json();
  if (!result.ok) throw new Error(result.description || `Telegram ${method} failed`);
  return result.result;
}

function corsPreflight(request, env) {
  const origin = request.headers.get('Origin') || '';
  if (!isAllowedOrigin(origin, env)) return new Response(null, {status: 403});
  return new Response(null, {status: 204, headers:{...corsHeaders(origin, env), 'Access-Control-Allow-Methods':'POST, OPTIONS', 'Access-Control-Allow-Headers':'Content-Type', 'Access-Control-Max-Age':'86400'}});
}
function allowedOrigins(env) { return String(env.ALLOWED_ORIGINS || '').split(',').map(v => v.trim()).filter(Boolean); }
function isAllowedOrigin(origin, env) { return allowedOrigins(env).some(value => origin === value || origin.startsWith(`${value}/`)); }
function corsHeaders(origin, env) { return isAllowedOrigin(origin, env) ? {'Access-Control-Allow-Origin':origin, 'Vary':'Origin'} : {}; }
function clean(value, max) { return typeof value === 'string' ? value.trim().replace(/[\u0000-\u001F\u007F]/g, ' ').slice(0, max) : ''; }
function escapeHtml(value) { return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char])); }
function compact(value) { return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined)); }
function safeFilename(name, index) { return String(name || `photo-${index + 1}.jpg`).replace(/[^a-zA-Z0-9._-]/g, '_').slice(-100); }
function json(value, status = 200, headers = {}) { return new Response(JSON.stringify(value), {status, headers:{'Content-Type':'application/json; charset=utf-8', ...headers}}); }
