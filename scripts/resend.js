const { PrismaClient } = require('@prisma/client');
const https = require('https');
const path = require('path');
const fs = require('fs');

// Read .env manually
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [k, ...v] = line.trim().split('=');
  if (k && v.length) env[k.trim()] = v.join('=').replace(/^"(.*)"$/, '$1');
});

const prisma = new PrismaClient();

async function main() {
  const order = await prisma.order.findUnique({
    where: { id: 7 },
    include: { items: { include: { product: true } } }
  });

  if (!order) {
    console.log('Order 6 not found');
    return;
  }

  const token = env.TELEGRAM_BOT_TOKEN;
  const chatId = env.TELEGRAM_CHAT_ID;

  const itemsList = order.items
    .map((item) => `• <b>${item.product.name}</b> × ${item.quantity} = ${(item.price * item.quantity).toFixed(0)} ₸`)
    .join('\n');

  const text = `🛒 <b>НОВЫЙ ЗАКАЗ #${order.id}</b>\n
👤 <b>Клиент:</b> ${order.customerName}
📞 <b>Телефон:</b> <code>${order.phone}</code>
${order.address ? `📍 <b>Адрес доставки:</b> ${order.address}\n` : ''}${order.comment ? `💬 <b>Комментарий:</b> <i>${order.comment}</i>\n` : ''}
📦 <b>Состав заказа:</b>
${itemsList}

💰 <b>ИТОГО К ОПЛАТЕ:</b> <b>${order.total.toFixed(0)} ₸</b>`;

  const cleanCustomerPhone = order.phone.replace(/\D/g, '');

  const payload = JSON.stringify({
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '💬 Открыть WhatsApp с клиентом',
            url: `https://wa.me/${cleanCustomerPhone}`,
          },
        ],
      ],
    },
  });

  const req = https.request({
    host: '149.154.167.220',
    port: 443,
    servername: 'api.telegram.org',
    headers: {
      'Host': 'api.telegram.org',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
    },
    path: `/bot${token}/sendMessage`,
    method: 'POST',
  }, (res) => {
    let body = '';
    res.on('data', c => body += c);
    res.on('end', () => console.log('ORDER NOTIFICATION SENT:', body));
  });

  req.on('error', console.error);
  req.write(payload);
  req.end();
}

main().finally(() => prisma.$disconnect());
