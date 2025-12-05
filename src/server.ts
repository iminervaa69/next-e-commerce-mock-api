import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import compression from 'compression'
import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'

dotenv.config()

const app = express()
const prisma = new PrismaClient()

// API Key for authentication
const MOCK_API_KEY = process.env.MOCK_API_KEY || 'mock-api-dev-key'
const MOCK_API_SECRET = process.env.MOCK_API_SECRET || 'mock-api-dev-secret'

// Middleware
app.use(cors())
app.use(compression())
app.use(express.json())

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`)
  next()
})

// =============================================
// SERVER INFO & AUTHENTICATION
// =============================================

/**
 * GET /
 * Server info and health check
 */
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'Mock API Server',
    version: '1.0.0',
    status: 'running',
    services: ['biteship', 'xendit'],
    endpoints: {
      health: '/health',
      config: '/api/config',
      biteship: '/v1/*',
      xendit: '/xendit/*'
    }
  })
})

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

/**
 * POST /api/config
 * Get server configuration (requires API key)
 * This endpoint is called by the main app to get mock API URL
 */
app.post('/api/config', (req: Request, res: Response) => {
  const { api_key, api_secret } = req.body

  if (!api_key || !api_secret) {
    return res.status(400).json({
      success: false,
      error: 'api_key and api_secret are required'
    })
  }

  if (api_key !== MOCK_API_KEY || api_secret !== MOCK_API_SECRET) {
    return res.status(401).json({
      success: false,
      error: 'Invalid API credentials'
    })
  }

  const serverUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 3002}`

  res.json({
    success: true,
    config: {
      url: serverUrl,
      services: {
        biteship: {
          base_path: '/v1',
          endpoints: ['/couriers', '/rates/couriers', '/orders', '/trackings']
        },
        xendit: {
          base_path: '/xendit',
          endpoints: ['/invoices', '/payment-channels', '/webhook']
        }
      }
    }
  })
})

/**
 * API Key verification middleware
 * Use this for protected endpoints
 */
const verifyApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '')
  
  // In development, allow requests without API key
  if (process.env.NODE_ENV === 'development' && !apiKey) {
    return next()
  }

  if (!apiKey || apiKey !== MOCK_API_KEY) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or missing API key'
    })
  }

  next()
}

// =============================================
// BITESHIP MOCK API
// =============================================

/**
 * GET /v1/couriers
 * List available couriers
 */
app.get('/v1/couriers', async (req: Request, res: Response) => {
  try {
    const couriers = await prisma.mockCourier.findMany({
      where: { is_active: true },
      orderBy: { courier_name: 'asc' }
    })

    res.json({
      success: true,
      couriers: couriers.map(c => ({
        courier_code: c.courier_code,
        courier_name: c.courier_name,
        courier_service_code: c.services || [],
        logo_url: c.logo_url
      }))
    })
  } catch (error) {
    console.error('Error fetching couriers:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

/**
 * POST /v1/rates/couriers
 * Get shipping rates
 */
app.post('/v1/rates/couriers', async (req: Request, res: Response) => {
  try {
    const { 
      couriers,
      origin_latitude,
      origin_longitude,
      destination_latitude,
      destination_longitude,
      items
    } = req.body

    console.log('📦 Mock rates request:', { 
      couriers,
      has_coordinates: !!(origin_latitude && destination_latitude),
      items_count: items?.length 
    })
    
    // Calculate distance using OSRM if coordinates provided
    let distanceKm: number | null = null
    
    if (origin_latitude && origin_longitude && destination_latitude && destination_longitude) {
      try {
        const osrmUrl = `https://routing.openstreetmap.de/routed-car/route/v1/driving/${origin_longitude},${origin_latitude};${destination_longitude},${destination_latitude}?overview=false`
        
        const osrmResponse = await fetch(osrmUrl, {
          method: 'GET',
          headers: { 'User-Agent': 'Mock-API-Server/1.0' },
          signal: AbortSignal.timeout(8000)
        })
        
        if (osrmResponse.ok) {
          const osrmData = await osrmResponse.json()
          if (osrmData.code === 'Ok' && osrmData.routes?.[0]) {
            distanceKm = osrmData.routes[0].distance / 1000
            console.log(`✅ Distance calculated: ${distanceKm.toFixed(2)} km`)
          }
        }
      } catch (error) {
        console.warn('⚠️ OSRM distance calculation failed:', error)
      }
    }
    
    // Parse courier codes
    const courierCodes = couriers ? couriers.split(',').map((c: string) => c.trim()) : []
    
    // Get rates from database
    const mockRates = await prisma.mockShippingRate.findMany({
      where: { 
        is_active: true,
        ...(courierCodes.length > 0 && { 
          courier: { courier_code: { in: courierCodes } } 
        })
      },
      include: { courier: true },
      orderBy: { base_price: 'asc' }
    })
    
    // Parse duration
    const parseDuration = (duration: string) => {
      const match = duration.match(/(\d+)(?:\s*-\s*(\d+))?/)
      if (match) {
        return {
          minimum_day: parseInt(match[1]),
          maximum_day: match[2] ? parseInt(match[2]) : parseInt(match[1])
        }
      }
      return { minimum_day: 1, maximum_day: 3 }
    }
    
    // Format response to match Biteship API
    const pricing = mockRates.map((rate: any) => {
      const { minimum_day, maximum_day } = parseDuration(rate.duration)
      
      // Calculate price based on distance
      let price = rate.base_price
      if (distanceKm) {
        price = rate.base_price + Math.round(distanceKm * rate.price_per_km)
        if (rate.min_price) price = Math.max(price, rate.min_price)
        if (rate.max_price) price = Math.min(price, rate.max_price)
      }
      
      // Apply discounts/surcharges
      price = price - (rate.shipping_fee_discount || 0) + (rate.shipping_fee_surcharge || 0)
      
      return {
        available_collection_method: rate.collection_method || ['pickup'],
        available_for_cash_on_delivery: rate.available_for_cod,
        available_for_proof_of_delivery: rate.available_for_pod,
        available_for_instant_waybill_id: rate.available_for_instant_waybill,
        available_for_insurance: rate.available_for_insurance,
        company: rate.courier?.courier_name || 'Unknown',
        courier_name: rate.courier?.courier_name || 'Unknown',
        courier_code: rate.courier?.courier_code || 'unknown',
        courier_service_name: rate.courier_service_name,
        courier_service_code: rate.courier_service_code,
        description: rate.description || `Layanan ${rate.courier_service_name}`,
        duration: rate.duration,
        shipment_duration_range: rate.shipment_duration_range || rate.duration.replace(' days', '').replace(' day', ''),
        shipment_duration_unit: rate.shipment_duration_unit || 'days',
        service_type: rate.service_type,
        shipping_type: rate.shipping_type || 'parcel',
        price,
        type: rate.service_type,
        insurance_fee: rate.insurance_fee || 0,
        cod_fee: rate.cod_fee || 0,
        min_day: minimum_day,
        max_day: maximum_day
      }
    })

    res.json({
      success: true,
      object: 'list',
      message: 'Mock rates retrieved successfully',
      code: 20000,
      origin: {},
      destination: {},
      pricing,
      _mock: true,
      _distance_km: distanceKm
    })
  } catch (error) {
    console.error('Error fetching rates:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

/**
 * POST /v1/orders
 * Create shipping order
 */
app.post('/v1/orders', async (req: Request, res: Response) => {
  try {
    const body = req.body
    
    // Generate mock IDs
    const biteshipOrderId = `MOCK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const trackingId = `TRK-${Date.now()}`
    const waybillId = `AWB${Date.now()}${Math.floor(Math.random() * 1000)}`
    
    // Create mock order
    const mockOrder = await prisma.mockBiteshipOrder.create({
      data: {
        order_id: body.reference_id || `order-${Date.now()}`,
        order_number: body.reference_id || `ORD-${Date.now()}`,
        biteship_order_id: biteshipOrderId,
        tracking_id: trackingId,
        waybill_id: waybillId,
        status: 'confirmed',
        courier_code: body.courier_company || 'jne',
        courier_name: body.courier_company?.toUpperCase() || 'JNE',
        courier_service_code: body.courier_type || 'reg',
        courier_service_name: body.courier_type === 'express' ? 'Express' : 'Reguler',
        origin_name: body.origin_contact_name || 'Seller',
        origin_phone: body.origin_contact_phone || '',
        origin_address: body.origin_address || '',
        destination_name: body.destination_contact_name || 'Buyer',
        destination_phone: body.destination_contact_phone || '',
        destination_address: body.destination_address || '',
        price: body.price || 0,
        items: body.items || [],
        status_history: {
          create: {
            status: 'confirmed',
            status_date: new Date(),
            note: 'Order confirmed'
          }
        }
      }
    })

    res.json({
      success: true,
      message: 'Mock order created successfully',
      object: 'order',
      id: biteshipOrderId,
      shipper: {
        name: mockOrder.origin_name,
        phone: mockOrder.origin_phone,
        address: mockOrder.origin_address
      },
      destination: {
        name: mockOrder.destination_name,
        phone: mockOrder.destination_phone,
        address: mockOrder.destination_address
      },
      courier: {
        company: mockOrder.courier_code,
        name: mockOrder.courier_name,
        type: mockOrder.courier_service_code,
        tracking_id: trackingId,
        waybill_id: waybillId
      },
      status: 'confirmed',
      price: mockOrder.price,
      _mock: true
    })
  } catch (error) {
    console.error('Error creating order:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

/**
 * POST /v1/orders/:id/status
 * Update order status (webhook simulator)
 */
app.post('/v1/orders/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { status, note, location, webhook_url } = req.body

    const validStatuses = [
      'confirmed', 'allocated', 'picking_up', 'picked',
      'dropping_off', 'delivered', 'cancelled', 'rejected', 'returned'
    ]

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      })
    }

    // Find order by biteship_order_id or order_id
    const mockOrder = await prisma.mockBiteshipOrder.findFirst({
      where: {
        OR: [
          { biteship_order_id: id },
          { order_id: id }
        ]
      }
    })

    if (!mockOrder) {
      return res.status(404).json({ success: false, error: 'Order not found' })
    }

    // Update order
    const updatedOrder = await prisma.mockBiteshipOrder.update({
      where: { id: mockOrder.id },
      data: {
        status,
        ...(status === 'picked' && { picked_at: new Date() }),
        ...(status === 'dropping_off' && { shipped_at: new Date() }),
        ...(status === 'delivered' && { delivered_at: new Date() }),
        status_history: {
          create: {
            status,
            status_date: new Date(),
            note: note || `Status updated to ${status}`,
            location
          }
        }
      }
    })

    // Send webhook if URL provided
    if (webhook_url) {
      try {
        await fetch(webhook_url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'order.status',
            order_id: mockOrder.biteship_order_id,
            status,
            courier_tracking_id: mockOrder.tracking_id,
            courier_waybill_id: mockOrder.waybill_id,
            updated_at: new Date().toISOString()
          })
        })
        console.log(`📤 Webhook sent to ${webhook_url}`)
      } catch (error) {
        console.error('Webhook failed:', error)
      }
    }

    res.json({
      success: true,
      message: 'Status updated',
      order_id: mockOrder.biteship_order_id,
      status: updatedOrder.status,
      _mock: true
    })
  } catch (error) {
    console.error('Error updating status:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

/**
 * GET /v1/trackings/:waybill_id
 * Track shipment
 */
app.get('/v1/trackings/:waybill_id', async (req: Request, res: Response) => {
  try {
    const { waybill_id } = req.params

    const mockOrder = await prisma.mockBiteshipOrder.findFirst({
      where: {
        OR: [
          { waybill_id },
          { tracking_id: waybill_id }
        ]
      },
      include: {
        status_history: {
          orderBy: { status_date: 'desc' }
        }
      }
    })

    if (!mockOrder) {
      return res.status(404).json({ success: false, error: 'Tracking not found' })
    }

    res.json({
      success: true,
      object: 'tracking',
      id: mockOrder.tracking_id,
      waybill_id: mockOrder.waybill_id,
      courier: {
        company: mockOrder.courier_code,
        name: mockOrder.courier_name,
        type: mockOrder.courier_service_code
      },
      status: mockOrder.status,
      history: mockOrder.status_history.map(h => ({
        status: h.status,
        date: h.status_date.toISOString(),
        note: h.note,
        location: h.location
      })),
      _mock: true
    })
  } catch (error) {
    console.error('Error tracking:', error)
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// =============================================
// ADMIN ENDPOINTS
// =============================================

/**
 * GET /admin/couriers
 * List all couriers (for admin)
 */
app.get('/admin/couriers', async (req: Request, res: Response) => {
  try {
    const couriers = await prisma.mockCourier.findMany({
      include: { rates: true },
      orderBy: { courier_name: 'asc' }
    })
    res.json({ success: true, couriers })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

/**
 * GET /admin/orders
 * List all mock orders
 */
app.get('/admin/orders', async (req: Request, res: Response) => {
  try {
    const orders = await prisma.mockBiteshipOrder.findMany({
      include: { status_history: true },
      orderBy: { created_at: 'desc' },
      take: 100
    })
    res.json({ success: true, orders })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
})

// =============================================
// HEALTH & INFO
// =============================================

app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok',
    service: 'mock-api-server',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  })
})

app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'Mock API Server',
    version: '1.0.0',
    endpoints: {
      biteship: {
        couriers: 'GET /v1/couriers',
        rates: 'POST /v1/rates/couriers',
        orders: 'POST /v1/orders',
        status: 'POST /v1/orders/:id/status',
        tracking: 'GET /v1/trackings/:waybill_id'
      },
      admin: {
        couriers: 'GET /admin/couriers',
        orders: 'GET /admin/orders'
      },
      health: 'GET /health'
    }
  })
})

// =============================================
// START SERVER
// =============================================

const PORT = process.env.PORT || 3002

app.listen(PORT, () => {
  console.log(`
🚀 Mock API Server started!
📡 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
🔗 Health: http://localhost:${PORT}/health
  `)
})

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down...')
  await prisma.$disconnect()
  process.exit(0)
})
