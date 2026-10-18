/**
 * WhatsApp Business Platform Cloud API интеграция
 * Официальный Meta Graph API для отправки автоматических уведомлений о заказах
 */

export interface OrderNotificationPayload {
  id: number
  customerName: string
  phone: string
  address?: string | null
  comment?: string | null
  total: number
  deliveryFee?: number | null
  createdAt?: Date | string
  items: Array<{
    product?: { name: string } | null
    quantity: number
    price: number
  }>
}

export interface WhatsAppSendResult {
  success: boolean
  messageId?: string
  error?: string
  skipped?: boolean
  details?: any
}

/**
 * Форматирует номер телефона в читаемый вид: +7 (XXX) XXX-XX-XX
 */
export function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8'))) {
    return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`
  }
  if (digits.length === 10) {
    return `+7 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8, 10)}`
  }
  return phone.startsWith('+') ? phone : `+${phone}`
}

/**
 * Форматирует заказ в точный текст уведомления для сотрудника на кассе
 * В соответствии со спецификацией интеграции
 */
export function formatOrderWhatsAppMessage(order: OrderNotificationPayload): string {
  // 1. Состав товаров
  const itemsLines = order.items.map((item) => {
    const name = item.product?.name || 'Товар'
    const qty = item.quantity
    const price = item.price
    const itemTotal = price * qty
    return `• ${name} — ${qty} шт. × ${price.toFixed(0)} ₽ = ${itemTotal.toFixed(0)} ₽`
  })

  // 2. Расчет сумм
  const itemsSubtotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  const isPickup =
    order.address?.toLowerCase().includes('самовывоз') ||
    order.comment?.toLowerCase().includes('самовывоз')

  let deliveryCost = 0
  if (typeof order.deliveryFee === 'number') {
    deliveryCost = order.deliveryFee
  } else if (order.total > itemsSubtotal) {
    deliveryCost = Math.max(0, order.total - itemsSubtotal)
  } else if (!isPickup && itemsSubtotal < 1500) {
    deliveryCost = 150
  }

  const finalTotal = itemsSubtotal + deliveryCost
  const deliveryText = isPickup
    ? 'Самовывоз (0 ₽)'
    : deliveryCost === 0
    ? 'Бесплатно (0 ₽)'
    : `${deliveryCost.toFixed(0)} ₽`

  // 3. Данные покупателя
  const formattedPhone = formatPhoneNumber(order.phone)
  const addressText = order.address?.trim() || (isPickup ? 'Самовывоз из магазина' : 'Не указан')
  const commentText = order.comment?.trim() || 'Нет'

  // 4. Время оформления заказа
  const dateObj = order.createdAt ? new Date(order.createdAt) : new Date()
  const dateFormatted = dateObj.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Moscow',
  })

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
  ].join('\n')
}

/**
 * Отправляет уведомление о новом заказе в WhatsApp сотрудника через WhatsApp Cloud API
 */
export async function sendWhatsAppOrderNotification(
  order: OrderNotificationPayload
): Promise<WhatsAppSendResult> {
  const staffPhone =
    process.env.WHATSAPP_STAFF_PHONE ||
    process.env.WHATSAPP_EMPLOYEE_PHONE ||
    process.env.OWNER_WHATSAPP_NUMBER ||
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
    '79287144816'

  const messageBody = formatOrderWhatsAppMessage(order)
  const cleanRecipientPhone = staffPhone.replace(/\D/g, '')

  // 1. Попытка отправки через Green API (самый надежный сервис QR-кода в РФ)
  const greenApiId = process.env.GREEN_API_ID_INSTANCE || process.env.GREEN_API_INSTANCE_ID
  const greenApiToken = process.env.GREEN_API_TOKEN || process.env.GREEN_API_API_TOKEN_INSTANCE

  if (greenApiId && greenApiToken) {
    try {
      const hostUrl = process.env.GREEN_API_URL || `https://${greenApiId.slice(0, 4)}.api.greenapi.com`
      const greenUrl = `${hostUrl.replace(/\/$/, '')}/waInstance${greenApiId}/sendMessage/${greenApiToken}`
      const greenRes = await fetch(greenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: `${cleanRecipientPhone}@c.us`,
          message: messageBody,
        }),
        signal: AbortSignal.timeout(7000),
      })
      const gData = await greenRes.json().catch(() => null)
      if (greenRes.ok && gData?.idMessage) {
        console.log(`\n✅ [Green API WhatsApp] Заказ #${order.id} успешно доставлен на +${cleanRecipientPhone}!`)
        console.log(`   Message ID: ${gData.idMessage}\n`)
        return { success: true, messageId: gData.idMessage, details: gData }
      } else {
        console.error(`\n❌ [Green API WhatsApp] Ошибка отправки заказа #${order.id}:`, gData)
      }
    } catch (gErr: any) {
      console.error(`\n❌ [Green API WhatsApp] Ошибка связи с сервером:`, gErr.message)
    }
  }

  // 2. Попытка отправки через локальный WhatsApp QR-шлюз (порт 3005)
  try {
    const gatewayRes = await fetch('http://localhost:3005/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: cleanRecipientPhone,
        text: messageBody,
      }),
      signal: AbortSignal.timeout(4000),
    }).catch(() => null)

    if (gatewayRes && gatewayRes.ok) {
      const gData = await gatewayRes.json().catch(() => null)
      if (gData?.success) {
        console.log(`\n✅ [WhatsApp Gateway] Уведомление о заказе #${order.id} успешно доставлено кассиру (+${cleanRecipientPhone})!`)
        return { success: true, messageId: gData.messageId, details: gData }
      }
    }
  } catch (_) {
    // Шлюз не запущен, переходим к Meta Cloud API
  }

  // 3. Если Green API и локальный шлюз не настроены, пробуем официальный Meta Cloud API
  const token = process.env.WHATSAPP_ACCESS_TOKEN || process.env.WHATSAPP_CLOUD_API_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

  // Если ни один шлюз не настроен:
  if (!token || !phoneNumberId) {
    console.log('\n⚠️ [WhatsApp] Уведомление о заказе #' + order.id + ' не отправлено:')
    console.log('   - Green API не настроен в .env (GREEN_API_ID_INSTANCE, GREEN_API_TOKEN)')
    console.log('   - Или укажите WHATSAPP_ACCESS_TOKEN и WHATSAPP_PHONE_NUMBER_ID (Meta Cloud API)\n')
    return {
      success: false,
      skipped: true,
      error: 'WhatsApp credentials not configured (Green API or Meta Cloud API)',
    }
  }

  const apiVersion = process.env.WHATSAPP_API_VERSION || 'v19.0'
  const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`

  // Поддержка как прямого текстового сообщения, так и зарегистрированного Meta шаблона (если указан)
  const payload = process.env.WHATSAPP_TEMPLATE_NAME
    ? {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanRecipientPhone,
        type: 'template',
        template: {
          name: process.env.WHATSAPP_TEMPLATE_NAME,
          language: { code: process.env.WHATSAPP_TEMPLATE_LANG || 'ru' },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: String(order.id) },
                { type: 'text', text: order.customerName },
                { type: 'text', text: `${order.total.toFixed(0)} ₽` },
                { type: 'text', text: order.address || 'Самовывоз' },
              ],
            },
          ],
        },
      }
    : {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanRecipientPhone,
        type: 'text',
        text: {
          preview_url: false,
          body: messageBody,
        },
      }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    const data = await response.json().catch(() => null)

    if (response.ok && data?.messages?.[0]?.id) {
      console.log(`\n✅ [WhatsApp Cloud API] Уведомление о заказе #${order.id} успешно доставлено сотруднику (${cleanRecipientPhone})!`)
      console.log(`   Message ID: ${data.messages[0].id}\n`)
      return { success: true, messageId: data.messages[0].id, details: data }
    } else {
      console.error(`\n❌ [WhatsApp Cloud API] Ошибка отправки заказа #${order.id}:`, data || response.statusText)
      return {
        success: false,
        error: data?.error?.message || `HTTP ${response.status}: ${response.statusText}`,
        details: data,
      }
    }
  } catch (err: any) {
    if (err.name === 'AbortError') {
      console.error(`❌ [WhatsApp Cloud API] Таймаут подключения к Meta Graph API при заказе #${order.id}`)
      return { success: false, error: 'Connection timeout to Meta Cloud API' }
    }
    console.error(`❌ [WhatsApp Cloud API] Сетевая ошибка при отправке заказа #${order.id}:`, err.message)
    return { success: false, error: err.message }
  }
}

/**
 * Вспомогательная функция для генерации прямой ссылки wa.me (для кликов пользователя при необходимости)
 */
export function generateWhatsAppUrl(phone: string, message: string): string {
  const cleanPhone = phone.replace(/\D/g, '')
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`
}

export function generateOrderNotificationText(order: {
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
}): string {
  return formatOrderWhatsAppMessage(order)
}

export function generateCustomerOrderText(orderId: number): string {
  return `Здравствуйте! Я оформил(а) заказ #${orderId} на сайте.`
}

export function generateCustomerToOwnerWhatsAppText(order: {
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
}): string {
  return formatOrderWhatsAppMessage(order)
}

