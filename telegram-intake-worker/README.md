# Telegram intake worker

The public site sends `multipart/form-data` to `/submit`. The worker validates the request, creates a forum topic for the patient in a private Telegram supergroup, posts the application, and forwards up to six images. It does not persist form contents or files.

Required Worker secrets:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `TELEGRAM_WEBHOOK_SECRET`

After deployment, set the bot webhook to:

`https://<worker-host>/telegram-webhook`

with `secret_token` equal to `TELEGRAM_WEBHOOK_SECRET`, then set the form's `data-endpoint` to:

`https://<worker-host>/submit`
