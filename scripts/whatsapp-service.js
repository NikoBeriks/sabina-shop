const {
  default: makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  Browsers,
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const QRCode = require('qrcode');
const qrcodeTerminal = require('qrcode-terminal');
const http = require('http');
const path = require('path');
const fs = require('fs');

// 1. Загрузка переменных из .env
const envPath = path.join(__dirname, '..', '.env');
const env = {};
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [k, ...v] = trimmed.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').replace(/^"(.*)"$/, '$1');
  });
}

const PORT = 3005;
const AUTH_DIR = path.join(__dirname, '..', 'whatsapp_auth');
const STAFF_PHONE =
  env.WHATSAPP_STAFF_PHONE ||
  env.OWNER_WHATSAPP_NUMBER ||
  env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
  '79287144816';

let sock = null;
let connectionState = 'connecting'; // 'connecting' | 'qr_ready' | 'connected' | 'disconnected'
let latestQrRaw = null;
let latestQrDataUrl = null;
let connectedPhone = null;
let qrTimeoutTimer = null;

async function startWhatsApp() {
  console.log('\n======================================================');
  console.log('📱 ЗАПУСК ЛОКАЛЬНОГО WHATSAPP ШЛЮЗА SABINA SHOP');
  console.log('======================================================');

  if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
  }

  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false, // мы выводим сами с подсказками
    logger: pino({ level: 'silent' }),
    browser: Browsers.ubuntu('Chrome'),
    connectTimeoutMs: 60000,
    keepAliveIntervalMs: 25000,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      latestQrRaw = qr;
      connectionState = 'qr_ready';
      try {
        latestQrDataUrl = await QRCode.toDataURL(qr, { margin: 2, scale: 8 });
      } catch (err) {
        console.error('Ошибка генерации QR DataURL:', err);
      }

      console.log('\n' + '='.repeat(60));
      console.log('📷 НОВЫЙ QR-КОД ДЛЯ ПОДКЛЮЧЕНИЯ WHATSAPP:');
      console.log('1. Откройте WhatsApp на телефоне');
      console.log('2. Перейдите: Настройки -> Связанные устройства -> Привязка устройства');
      console.log('3. Наведите камеру телефона на QR-код ниже:');
      console.log('='.repeat(60) + '\n');

      qrcodeTerminal.generate(qr, { small: true });

      console.log('\n🌐 Вы также можете открыть QR-код в браузере:');
      console.log(`👉 http://localhost:${PORT}/qr\n`);
    }

    if (connection === 'open') {
      connectionState = 'connected';
      latestQrRaw = null;
      latestQrDataUrl = null;
      connectedPhone =
        sock.user?.id?.split(':')[0] || sock.user?.id?.split('@')[0] || 'Unknown';

      console.log('\n' + '='.repeat(60));
      console.log(`✅ WHATSAPP УСПЕШНО ПОДКЛЮЧЕН!`);
      console.log(`   Привязанный номер: +${connectedPhone}`);
      console.log(`   Уведомления о заказах будут приходить на номер: +${STAFF_PHONE}`);
      console.log(`   Шлюз работает и готов отправлять заказы в фоновом режиме.`);
      console.log('='.repeat(60) + '\n');
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      console.log(`\n⚠️ Соединение WhatsApp закрыто (код: ${statusCode}). Переподключение: ${shouldReconnect}`);
      connectionState = 'disconnected';

      if (shouldReconnect) {
        setTimeout(() => startWhatsApp(), 3000);
      } else {
        console.log('ℹ️ Сессия была завершена на телефоне. Сброс авторизации...');
        try {
          fs.rmSync(AUTH_DIR, { recursive: true, force: true });
        } catch (_) {}
        setTimeout(() => startWhatsApp(), 2000);
      }
    }
  });
}

// 2. HTTP API сервер для общения с Next.js
const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  // Статус подключения
  if (url.pathname === '/status' || url.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(
      JSON.stringify({
        status: connectionState,
        connectedPhone,
        staffPhone: STAFF_PHONE,
        hasQr: !!latestQrDataUrl,
        qr: latestQrDataUrl,
      })
    );
    return;
  }

  // Веб-страница с визуальным QR-кодом
  if (url.pathname === '/qr') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Подключение WhatsApp — Sabina Shop</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: #0f1115;
      color: #f1f3f5;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .card {
      background: #181b20;
      border: 1px solid #2a2e36;
      width: 100%;
      max-width: 440px;
      padding: 32px;
      text-align: center;
      border-radius: 4px;
      box-shadow: 0 12px 30px rgba(0,0,0,0.4);
    }
    .badge {
      display: inline-block;
      font-size: 11px;
      font-family: monospace;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding: 4px 10px;
      background: #232730;
      border: 1px solid #363b46;
      margin-bottom: 16px;
    }
    h1 {
      font-size: 20px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: -0.5px;
      margin-bottom: 8px;
    }
    p {
      font-size: 13px;
      color: #9aa0a6;
      line-height: 1.5;
      margin-bottom: 24px;
    }
    .qr-box {
      background: #fff;
      padding: 16px;
      display: inline-block;
      border-radius: 2px;
      margin-bottom: 24px;
      min-width: 250px;
      min-height: 250px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .qr-box img {
      display: block;
      width: 240px;
      height: 240px;
    }
    .steps {
      text-align: left;
      background: #20242c;
      border: 1px solid #2e333d;
      padding: 16px;
      font-size: 12px;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .steps ol { padding-left: 20px; }
    .status-pill {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 600;
      padding: 10px;
      background: #232730;
      border: 1px solid #363b46;
    }
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #f59e0b;
      animation: pulse 1.5s infinite;
    }
    .dot.connected { background: #10b981; animation: none; }
    @keyframes pulse { 0% { opacity: 0.4; } 50% { opacity: 1; } 100% { opacity: 0.4; } }
    .btn {
      display: block;
      width: 100%;
      padding: 12px;
      background: #fff;
      color: #000;
      text-decoration: none;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border: none;
      cursor: pointer;
      margin-top: 12px;
    }
    .btn:hover { background: #e5e5e5; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">SABINA SHOP &middot; WHATSAPP GATEWAY</div>
    <h1>Привязка WhatsApp</h1>
    <p>Отсканируйте QR-код для автоматической отправки уведомлений о заказах кассиру на номер +${STAFF_PHONE}</p>

    <div id="qr-container">
      ${
        latestQrDataUrl
          ? `<div class="qr-box"><img src="${latestQrDataUrl}" alt="WhatsApp QR Code"></div>`
          : connectionState === 'connected'
          ? `<div class="status-pill" style="border-color:#059669;color:#34d399;margin-bottom:24px;padding:20px;">
               <span class="dot connected"></span> WhatsApp успешно привязан (+${connectedPhone})!
             </div>`
          : `<div class="qr-box"><span style="color:#000;font-size:12px;">Генерация QR-кода...</span></div>`
      }
    </div>

    <div class="steps">
      <strong>Инструкция:</strong>
      <ol>
        <li>Откройте <b>WhatsApp</b> на телефоне</li>
        <li>Перейдите в <b>Настройки &rarr; Связанные устройства</b></li>
        <li>Нажмите <b>«Привязка устройства»</b> и наведите камеру</li>
      </ol>
    </div>

    <div class="status-pill" id="status-pill">
      <span class="dot ${connectionState === 'connected' ? 'connected' : ''}"></span>
      <span id="status-text">${
        connectionState === 'connected'
          ? 'Подключено (+ ' + connectedPhone + ')'
          : connectionState === 'qr_ready'
          ? 'Ожидание сканирования...'
          : 'Подключение...'
      }</span>
    </div>

    ${
      connectionState === 'connected'
        ? `<button class="btn" onclick="testSend()">Отправить тестовое сообщение</button>`
        : ''
    }
  </div>

  <script>
    async function checkStatus() {
      try {
        const res = await fetch('/status');
        const data = await res.json();
        const textEl = document.getElementById('status-text');
        const qrEl = document.getElementById('qr-container');

        if (data.status === 'connected') {
          textEl.innerText = 'Подключено (+ ' + data.connectedPhone + ')';
          qrEl.innerHTML = '<div class="status-pill" style="border-color:#059669;color:#34d399;margin-bottom:24px;padding:20px;"><span class="dot connected"></span> WhatsApp успешно привязан (+' + data.connectedPhone + ')!</div>';
        } else if (data.status === 'qr_ready' && data.qr) {
          textEl.innerText = 'Ожидание сканирования...';
          qrEl.innerHTML = '<div class="qr-box"><img src="' + data.qr + '" alt="QR"></div>';
        }
      } catch (e) {}
    }

    async function testSend() {
      const btn = event.target;
      btn.disabled = true;
      btn.innerText = 'ОТПРАВКА...';
      try {
        const res = await fetch('/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: '${STAFF_PHONE}',
            text: '🛒 ТЕСТОВОЕ СООБЩЕНИЕ ИЗ SABINA SHOP\\n\\nWhatsApp шлюз работает отлично! Новые заказы будут приходить сюда автоматически.'
          })
        });
        const d = await res.json();
        if (d.success) {
          alert('✅ Тестовое сообщение доставлено в WhatsApp!');
        } else {
          alert('Ошибка: ' + (d.error || 'не удалось отправить'));
        }
      } catch (e) {
        alert('Ошибка связи с сервером');
      } finally {
        btn.disabled = false;
        btn.innerText = 'ОТПРАВИТЬ ТЕСТОВОЕ СООБЩЕНИЕ';
      }
    }

    setInterval(checkStatus, 2500);
  </script>
</body>
</html>`);
    return;
  }

  // Отправка сообщения
  if (url.pathname === '/send' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', async () => {
      try {
        const { phone, text } = JSON.parse(body || '{}');

        if (!sock || connectionState !== 'connected') {
          res.writeHead(503, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              success: false,
              error: 'WhatsApp шлюз не подключен. Отсканируйте QR-код на странице http://localhost:3005/qr',
            })
          );
          return;
        }

        if (!phone || !text) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Укажите phone и text' }));
          return;
        }

        const cleanPhone = String(phone).replace(/\D/g, '');
        const jid = cleanPhone.includes('@') ? cleanPhone : `${cleanPhone}@s.whatsapp.net`;

        console.log(`\n📤 [WhatsApp Gateway] Отправка сообщения на ${jid}...`);
        const result = await sock.sendMessage(jid, { text });

        console.log(`✅ [WhatsApp Gateway] Доставлено! ID: ${result?.key?.id}`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            success: true,
            messageId: result?.key?.id,
            to: cleanPhone,
          })
        );
      } catch (err) {
        console.error('❌ [WhatsApp Gateway] Ошибка отправки:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // Сброс авторизации
  if (url.pathname === '/reset' && req.method === 'POST') {
    try {
      if (sock) {
        try {
          await sock.logout();
        } catch (_) {}
      }
      fs.rmSync(AUTH_DIR, { recursive: true, force: true });
      setTimeout(() => startWhatsApp(), 1000);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Авторизация сброшена' }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`📡 HTTP-сервер WhatsApp шлюза слушает на http://localhost:${PORT}`);
  startWhatsApp().catch((err) => console.error('Критическая ошибка запуска:', err));
});
