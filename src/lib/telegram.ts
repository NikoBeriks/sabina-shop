import https from 'https'

export async function sendTelegramOrderNotification(order: {
  id: number
  customerName: string
  phone: string
  address?: string | null
  comment?: string | null
  total: number
  items: Array<{
    product: { name: string }
    quantity: number
    price: number
  }>
}) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    console.log('\n⚠️ [Telegram Bot] Уведомление не отправлено: в .env не указаны TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID')
    return null
  }

  const itemsList = order.items
    .map(
      (item) =>
        `• <b>${item.product.name}</b> × ${item.quantity} = ${(item.price * item.quantity).toFixed(0)} ₸`
    )
    .join('\n')

  const text = `🛒 <b>НОВЫЙ ЗАКАЗ #${order.id}</b>\n
👤 <b>Клиент:</b> ${order.customerName}
📞 <b>Телефон:</b> <code>${order.phone}</code>
${order.address ? `📍 <b>Адрес доставки:</b> ${order.address}\n` : ''}${order.comment ? `💬 <b>Комментарий:</b> <i>${order.comment}</i>\n` : ''}
📦 <b>Состав заказа:</b>
${itemsList}

💰 <b>ИТОГО К ОПЛАТЕ:</b> <b>${order.total.toFixed(0)} ₸</b>`

  const cleanCustomerPhone = order.phone.replace(/\D/g, '')

  const payload = JSON.stringify({
    chat_id: chatId,
    text,
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '💬 Открыть диалог в WhatsApp',
            url: `https://wa.me/${cleanCustomerPhone}`,
          },
        ],
      ],
    },
  })

  return new Promise((resolve) => {
    // 149.154.167.220 is official Telegram DC unblocked by Russian ISP DPI
    const host = process.env.TELEGRAM_IP || '149.154.167.220'
    const req = https.request(
      {
        host,
        port: 443,
        servername: 'api.telegram.org',
        headers: {
          'Host': 'api.telegram.org',
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
        path: `/bot${token}/sendMessage`,
        method: 'POST',
        timeout: 5000,
      },
      (res) => {
        let body = ''
        res.on('data', (chunk) => (body += chunk))
        res.on('end', () => {
          try {
            const data = JSON.parse(body)
            if (data.ok) {
              console.log(`✅ [Telegram Bot] Уведомление о заказе #${order.id} успешно доставлено в Telegram!`)
            } else {
              console.error(`❌ [Telegram Bot] Ошибка Telegram API:`, data)
              if (data.description?.includes('chat not found')) {
                console.warn(`💡 ВНИМАНИЕ: Пользователь с chat_id=${chatId} ещё не нажал "Запустить" (/start) в боте @KhavpachevShopBot!`)
              }
            }
            resolve(data)
          } catch {
            console.error('❌ Ошибка парсинга ответа от Telegram:', body)
            resolve(null)
          }
        })
      }
    )

    req.on('timeout', () => {
      console.error('❌ Таймаут подключения к Telegram API')
      req.destroy()
      resolve(null)
    })

    req.on('error', (err) => {
      console.error('❌ Ошибка сети при отправке в Telegram:', err.message)
      resolve(null)
    })

    req.write(payload)
    req.end()
  })
}
