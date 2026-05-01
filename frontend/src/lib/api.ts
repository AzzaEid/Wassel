import axios from 'axios'

// Use 127.0.0.1 instead of localhost to avoid potential DNS issues
const api = axios.create({ 
  baseURL: 'http://127.0.0.1:8000',
  timeout: 10000
})

// Add response interceptor for debugging
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', {
      code: error.code,
      message: error.message,
      status: error.response?.status,
      url: error.config?.url
    })
    return Promise.reject(error)
  }
)

export const getDashboard = (merchantId: string) =>
  api.get(`/api/dashboard/${merchantId}`).then(r => r.data)

export const getScoring = (phone: string) =>
  api.get(`/api/scoring/${encodeURIComponent(phone)}`).then(r => r.data)

export const createOrder = (data: {
  merchant_id: string
  customer_phone: string
  customer_name?: string
  product_name: string
  amount: number
  delivery_address?: string
}) => api.post('/api/orders', data).then(r => r.data)

export const cancelOrder = (orderId: string) =>
  api.post(`/api/orders/${orderId}/cancel`).then(r => r.data)

export const getOrderStatus = (orderId: string) =>
  api.get(`/api/orders/${orderId}`).then(r => r.data)

export const processPayment = (orderId: string, type: 'deposit' | 'full') =>
  api.post(`/api/payments/${orderId}/pay`, {
    payment_type: type,
    mock_card: '4242424242424242',
  }).then(r => r.data)

export const confirmDelivery = (orderId: string) =>
  api.post(`/api/escrow/${orderId}/customer-confirm`).then(r => r.data)

export const reportDispute = (orderId: string) =>
  api.post(`/api/escrow/${orderId}/dispute`).then(r => r.data)

export const adminSimulate = (action: string, orderId: string) =>
  api.post(`/api/admin/simulate/${action}/${orderId}`).then(r => r.data)

export const adminReset = () =>
  api.post('/api/admin/reset').then(r => r.data)

export const adminEvents = () =>
  api.get('/api/admin/events').then(r => r.data)

export const getDeliveryQueue = () =>
  api.get('/api/admin/delivery-queue').then(r => r.data)

export const fireDriverAction = (action: 'delivered' | 'refused', orderId: string) =>
  api.post(`/api/admin/simulate/${action}/${orderId}`).then(r => r.data)

export const sendDeliveryWebhook = (data: {
  event: string
  merchant_id: string
  customer_phone: string
  customer_name?: string
  product_name: string
  total_amount: number
  delivery_address?: string
}) => api.post('/webhooks/delivery', data).then(r => r.data)
