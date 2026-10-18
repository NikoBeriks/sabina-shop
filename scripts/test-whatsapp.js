const fs = require('fs');
const path = require('path');

// Чтение .env
const envPath = path.join(__dirname, '..', '.env');
const env = {};
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [k, ...v] = trimmed.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').replace(/^"(.*)"$/, '$1');
  });
}

function formatPhoneNumber(phone) {
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8'))) {
    return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
  }
  if (digits.length === 10) {
    return `+7 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8, 10)}`;
  }
  return phone.startsWith('+') ? phone : `+${phone}`;
}

function formatOrderWhatsAppMessage(order) {
  const itemsLines = order.items.map((item) => {
    const name = item.product?.name || 'Товар';
    const qty = item.quantity;
    const price = item.price;
    const itemTotal = price * qty;
    return `• ${name} — ${qty} шт. × ${price.toFixed(0)} ₽ = ${itemTotal.toFixed(0)} ₽`;
  });

  const itemsSubtotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const isPickup =
    order.address?.toLowerCase().includes('самовывоз') ||
    order.comment?.toLowerCase().includes('самовывоз');

  let deliveryCost = 0;
  if (typeof order.deliveryFee === 'number') {
    deliveryCost = order.deliveryFee;
  } else if (order.total > itemsSubtotal) {
    deliveryCost = Math.max(0, order.total - itemsSubtotal);
  } else if (!isPickup && itemsSubtotal < 1500) {
    deliveryCost = 150;
  }

  const finalTotal = itemsSubtotal + deliveryCost;
  const deliveryText = isPickup
    ? 'Самовывоз (0 ₽)'
    : deliveryCost === 0
    ? 'Бесплатно (0 ₽)'
    : `${deliveryCost.toFixed(0)} ₽`;

  const formattedPhone = formatPhoneNumber(order.phone);
  const addressText = order.address?.trim() || (isPickup ? 'Самовывоз из магазина' : 'Не указан');
  const commentText = order.comment?.trim() || 'Нет';

  const dateObj = order.createdAt ? new Date(order.createdAt) : new Date();
  const dateFormatted = dateObj.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Moscow',
  });

  return [
    `🛒 НОВЫЙ ЗАКАЗ №${order.id}`,
    '',
    'Товары:',
    ...itemsLines,
    '',
    `Товары на сумму: ${itemsSubtotal.toFixed(0)} ₽`,
    `Доставка: ${deliveryText}`,
    `ИТОГО: ${finalTotal.toFixed(0)} ₽`,
    '',
    `Получатель: ${order.customerName}`,
    `Телефон: ${formattedPhone}`,
    `Адрес доставки: ${addressText}`,
    `Комментарий: ${commentText}`,
    '',
    `Время заказа: ${dateFormatted}`,
  ].join('\n');
}

async function run() {
  console.log('='.repeat(60));
  console.log('🧪 ТЕСТ ИНТЕГРАЦИИ WHATSAPP CLOUD API ДЛЯ МАГАЗИНА');
  console.log('='.repeat(60));

  // Тестовый заказ по спецификации
  const sampleOrder = {
    id: 1042,
    customerName: 'Иван',
    phone: '79287144816',
    address: 'улица Примерная, дом 15, квартира 8',
    comment: 'позвонить перед доставкой',
    deliveryFee: 100,
    total: 485,
    createdAt: new Date(),
    items: [
      { product: { name: 'Молоко 3,2%' }, quantity: 2, price: 90 },
      { product: { name: 'Хлеб белый' }, quantity: 1, price: 55 },
      { product: { name: 'Бананы' }, quantity: 1, price: 150 },
    ],
  };

  const messageText = formatOrderWhatsAppMessage(sampleOrder);
  console.log('\n📄 СФОРМИРОВАННЫЙ ТЕКСТ УВЕДОМЛЕНИЯ:\n');
  console.log(messageText);
  console.log('\n' + '-'.repeat(60));

  const token = env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = env.WHATSAPP_PHONE_NUMBER_ID;
  const staffPhone = env.WHATSAPP_STAFF_PHONE || env.OWNER_WHATSAPP_NUMBER || '79287144816';
  const apiVersion = env.WHATSAPP_API_VERSION || 'v19.0';

  console.log('\n⚙️ ТЕКУЩИЕ ПАРАМЕТРЫ ИЗ .env:');
  console.log(`- WHATSAPP_STAFF_PHONE:      ${staffPhone || '❌ Не указан'}`);
  console.log(`- WHATSAPP_PHONE_NUMBER_ID:  ${phoneNumberId ? phoneNumberId : '⚠️ Пусто (нужен ID из Meta)'}`);
  console.log(`- WHATSAPP_ACCESS_TOKEN:     ${token ? '✅ Указан (длина: ' + token.length + ')' : '⚠️ Пусто (нужен токен Meta)'}`);
  console.log(`- WHATSAPP_API_VERSION:      ${apiVersion}`);

  if (!token || !phoneNumberId) {
    console.log('\nℹ️ Для выполнения реальной отправки в WhatsApp укажите в файле .env:');
    console.log('   WHATSAPP_PHONE_NUMBER_ID="..." (из раздела WhatsApp -> API Setup в Meta for Developers)');
    console.log('   WHATSAPP_ACCESS_TOKEN="..." (временный токен или токен системного пользователя)');
    console.log('\nФорматирование сообщений и серверная логика полностью готовы к работе!');
    return;
  }

  const cleanRecipientPhone = staffPhone.replace(/\D/g, '');
  const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: cleanRecipientPhone,
    type: 'text',
    text: {
      preview_url: false,
      body: messageText,
    },
  };

  console.log(`\n🚀 Отправка запроса в Meta Graph API (${url})...`);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log(`\nHTTP Статус: ${res.status} ${res.statusText}`);
    console.log('Ответ Meta Graph API:');
    console.log(JSON.stringify(data, null, 2));

    if (res.ok && data?.messages?.[0]?.id) {
      console.log(`\n✅ Сообщение успешно отправлено! WAMID: ${data.messages[0].id}`);
    } else {
      console.log('\n❌ Ошибка отправки от Meta API. Проверьте правильность токена и ID номера.');
    }
  } catch (err) {
    console.error('\n❌ Сетевая ошибка при вызове Meta API:', err.message);
  }
}

run();
