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
  const itemsList = order.items
    .map((item) => `• ${item.product.name} × ${item.quantity} = ${(item.price * item.quantity).toFixed(0)} ₽`)
    .join('\n')

  return `🛍️ *Новый заказ #${order.id}*

👤 *Клиент:* ${order.customerName}
📞 *Телефон:* ${order.phone}
${order.address ? `📍 *Адрес:* ${order.address}` : ''}
${order.comment ? `💬 *Комментарий:* ${order.comment}` : ''}

📦 *Товары:*
${itemsList}

💰 *Итого:* ${order.total.toFixed(0)} ₽

Перейдите в админ-панель для подтверждения заказа.`
}

export function generateCustomerOrderText(orderId: number): string {
  return `Здравствуйте! Я только что оформил(а) заказ #${orderId} на вашем сайте. Хотел(а) бы уточнить детали доставки.`
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
  const itemsList = order.items
    .map((item) => `• ${item.product.name} × ${item.quantity} = ${(item.price * item.quantity).toFixed(0)} ₽`)
    .join('\n')

  return `Здравствуйте! Я оформил(а) заказ в онлайн-магазине.

🛍️ *Заказ #${order.id}*
👤 *Покупатель:* ${order.customerName}
📞 *Телефон:* ${order.phone}
${order.address ? `📍 *Адрес доставки:* ${order.address}\n` : ''}${order.comment ? `💬 *Комментарий:* ${order.comment}\n` : ''}
📦 *Состав заказа:*
${itemsList}

💰 *Итого к оплате:* ${order.total.toFixed(0)} ₽

Подтвердите, пожалуйста, заказ и отправьте реквизиты для оплаты.`
}
