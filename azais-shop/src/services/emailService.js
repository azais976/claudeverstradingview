import emailjs from '@emailjs/browser'

const SERVICE_ID  = import.meta.env.VITE_EJS_SERVICE  || ''
const TPL_CLIENT  = import.meta.env.VITE_EJS_TPL_CLIENT || ''
const TPL_OWNER   = import.meta.env.VITE_EJS_TPL_OWNER  || ''
const PUBLIC_KEY  = import.meta.env.VITE_EJS_KEY        || ''
const OWNER_EMAIL = 'azais976.o@gmail.com'

function configured() { return SERVICE_ID && PUBLIC_KEY && TPL_CLIENT && TPL_OWNER }

export async function sendOrderEmails(order) {
  const base = {
    order_id:          order.id,
    product_name:      order.productName,
    product_price:     order.price + ' €',
    size:              order.size || 'N/A',
    qty:               String(order.qty),
    total:             (order.price * order.qty) + ' €',
    customer_name:     `${order.customer.firstName} ${order.customer.lastName}`,
    customer_email:    order.customer.email,
    customer_phone:    order.customer.phone || 'Non renseigné',
    customer_address:  `${order.customer.address}, ${order.customer.zip} ${order.customer.city}, ${order.customer.country}`,
    order_date:        order.date,
    notes:             order.customer.notes || 'Aucune',
  }

  if (!configured()) {
    console.warn('[Azais Shop] EmailJS non configuré — emails non envoyés.')
    return
  }

  await emailjs.send(SERVICE_ID, TPL_CLIENT, { ...base, to_email: order.customer.email }, PUBLIC_KEY)
  await emailjs.send(SERVICE_ID, TPL_OWNER,  { ...base, to_email: OWNER_EMAIL }, PUBLIC_KEY)
}
