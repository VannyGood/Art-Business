# Deploying Алёна Art Studio (VPS + domain)

Use this checklist when you have a **VPS** (Ubuntu 22.04+ recommended) and a **domain** pointed at the server’s public IP.

---

## 1. DNS

1. In your registrar, create an **A record**: `yourdomain.com` → VPS public IPv4.
2. Optional: `www` → same IP (CNAME to apex or duplicate A).
3. Wait for propagation (often minutes, sometimes up to 48 h). Check with `nslookup yourdomain.com`.

---

## 2. Server baseline

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx certbot python3-certbot-nginx git ufw
```

Firewall (adjust if you use non-standard SSH):

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## 3. Node.js (LTS)

Install Node 22 LTS (or current LTS from [nodejs.org](https://nodejs.org)) using your preferred method (`nvm`, NodeSource, etc.). Verify:

```bash
node -v
npm -v
```

---

## 4. PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib
sudo -u postgres psql -c "CREATE USER aliona WITH PASSWORD 'STRONG_PASSWORD_HERE';"
sudo -u postgres psql -c "CREATE DATABASE aliona_art OWNER aliona;"
```

Connection string for the app:

`DATABASE_URL=postgresql://aliona:STRONG_PASSWORD_HERE@127.0.0.1:5432/aliona_art`

---

## 5. Application user and directory

```bash
sudo adduser --disabled-password --gecos "" aliona
sudo mkdir -p /var/www/aliona
sudo chown aliona:aliona /var/www/aliona
```

Deploy as `aliona`:

```bash
sudo -u aliona bash
cd /var/www/aliona
git clone <YOUR_REPO_URL> .
npm ci
```

---

## 6. Environment file

Create `/var/www/aliona/.env` (mode `600`, owned by `aliona`):

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes | Postgres connection string |
| `ADMIN_PASSWORD` | Yes | Admin login at `/admin` |
| `ADMIN_SESSION_SECRET` | Yes | Long random string (32+ chars) for signing the admin cookie |
| `GALLERY_UPLOAD_DIR` | Recommended on VPS | Absolute path for uploaded gallery files, e.g. `/var/www/aliona/public/gallery` (must exist and be writable) |
| `TELEGRAM_BOT_TOKEN` | Optional | Bot API token |
| `TELEGRAM_BOT_USERNAME` | Optional | Bot username without `@` (checkout deep link) |
| `TELEGRAM_ADMIN_CHAT_ID` | Optional | Chat ID for **group** with you + bot (payment alerts + daily digest). Often looks like `-1001234567890` |
| `CRON_SECRET` | Optional | Random secret; send as header `x-cron-secret` when calling the reminders endpoint |

Example:

```env
DATABASE_URL=postgresql://aliona:...@127.0.0.1:5432/aliona_art
ADMIN_PASSWORD=...
ADMIN_SESSION_SECRET=...
GALLERY_UPLOAD_DIR=/var/www/aliona/public/gallery
```

Create gallery directory if you set `GALLERY_UPLOAD_DIR`:

```bash
mkdir -p /var/www/aliona/public/gallery
chown -R aliona:aliona /var/www/aliona/public/gallery
```

---

## 7. Database migrations

From `/var/www/aliona`:

```bash
export $(grep -v '^#' .env | xargs)
npm run db:migrate
```

---

## 8. Build and run

```bash
npm run build
```

Production process (pick one):

### Option A — `node` (simple)

```bash
cd /var/www/aliona
export $(grep -v '^#' .env | xargs)
node .output/server/index.mjs
```

By default the Nitro Node preset listens on a port from env (often `PORT` or Nitro’s default). Set `PORT=3000` in `.env` or systemd `Environment=`.

### Option B — systemd unit

Create `/etc/systemd/system/aliona.service`:

```ini
[Unit]
Description=Aliona Art Studio
After=network.target postgresql.service

[Service]
Type=simple
User=aliona
WorkingDirectory=/var/www/aliona
EnvironmentFile=/var/www/aliona/.env
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/bin/node .output/server/index.mjs
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Then:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now aliona
sudo systemctl status aliona
```

---

## 9. Nginx reverse proxy

Example `/etc/nginx/sites-available/aliona`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    client_max_body_size 12M;
}
```

Enable site and reload:

```bash
sudo ln -s /etc/nginx/sites-available/aliona /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

---

## 10. HTTPS (Let’s Encrypt)

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Certbot will install certificates and renew hooks automatically.

---

## 11. Telegram (optional)

1. Create a bot with [@BotFather](https://t.me/BotFather), get `TELEGRAM_BOT_TOKEN` and set `TELEGRAM_BOT_USERNAME`.
2. Create a **group**, add yourself and the bot. Post any message in the group, then open:

   `https://api.telegram.org/bot<TOKEN>/getUpdates`

   Find `"chat":{"id":-100...}` — that value is `TELEGRAM_ADMIN_CHAT_ID`.

3. Set webhook URL (HTTPS required by Telegram):

   `https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://yourdomain.com/api/telegram/webhook`

4. On VPS `.env`:

   ```env
   TELEGRAM_BOT_TOKEN=123456:ABC...
   TELEGRAM_BOT_USERNAME=your_bot_name
   TELEGRAM_ADMIN_CHAT_ID=-1001234567890
   ```

5. Run migration `0002` if the DB was created before telegram profile columns:

   ```bash
   npm run db:migrate
   ```

**Behaviour:** after test/real payment, the bot posts to the admin group (name, sum, @username from form, Telegram ID if the client pressed Start in the bot). If the client opened the bot from the checkout link, they get a Russian message that Alyona will write soon.

---

## 12. Cron reminders (optional)

Call once per day (Moscow-day logic is in the handler; server should use correct timezone or accept UTC behaviour):

```bash
curl -fsS -H "x-cron-secret: YOUR_CRON_SECRET" "https://yourdomain.com/api/cron/reminders"
```

Example crontab line (06:00 server time):

`0 6 * * * curl -fsS -H "x-cron-secret: YOUR_CRON_SECRET" "https://yourdomain.com/api/cron/reminders" >/dev/null 2>&1`

If `CRON_SECRET` is unset, the endpoint may still run without auth (not recommended in production).

---

## 13. Backups

- **Postgres**: nightly `pg_dump` of `aliona_art` to a remote or encrypted volume.
- **Gallery files**: backup `GALLERY_UPLOAD_DIR` (or `public/gallery`) together with the database so image paths stay valid.

---

## 14. Payments and legal (next business steps)

- Replace the mock checkout with a real provider (e.g. ЮKassa / CloudPayments / СБП) and webhooks to mark `payments` as paid.
- Publish **privacy policy** and **terms / offer** pages and link them in the footer (required for personal data and paid services in many jurisdictions).
- Replace placeholder social links (`#`) with real Instagram / Telegram / Pinterest URLs.

---

## 15. Updates after code changes

```bash
cd /var/www/aliona
sudo -u aliona git pull
sudo -u aliona npm ci
export $(grep -v '^#' .env | xargs)
sudo -u aliona npm run db:migrate
sudo -u aliona npm run build
sudo systemctl restart aliona
```

---

## Quick verification

- Site: `https://yourdomain.com`
- Admin: `https://yourdomain.com/admin`
- Public gallery JSON: `https://yourdomain.com/api/gallery`
- Example image: open a work on the site and confirm `/gallery/<filename>` loads

If images 404 after deploy, check `GALLERY_UPLOAD_DIR`, permissions, and that nginx `client_max_body_size` allows your uploads.
