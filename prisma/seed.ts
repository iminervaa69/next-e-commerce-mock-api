import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

// Simple CSV parser
function parseCSV(content: string): Record<string, string>[] {
  const lines = content.trim().split('\n')
  const headers = lines[0].split(',')
  
  return lines.slice(1).map(line => {
    const values: string[] = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    values.push(current.trim())
    
    const row: Record<string, string> = {}
    headers.forEach((header, index) => {
      row[header.trim()] = values[index] || ''
    })
    return row
  })
}

// Parse boolean from CSV
function parseBool(value: string): boolean {
  return value.toLowerCase() === 'true'
}

// Parse int from CSV
function parseInt(value: string): number {
  return Number(value) || 0
}

// Parse JSON array from CSV (handles PostgreSQL array format like {pickup,drop_off})
function parseArray(value: string): string[] {
  if (!value) return []
  // Handle PostgreSQL array format: {value1,value2}
  if (value.startsWith('{') && value.endsWith('}')) {
    return value.slice(1, -1).split(',').map(s => s.trim())
  }
  // Handle JSON array format
  try {
    return JSON.parse(value)
  } catch {
    return [value]
  }
}

async function main() {
  console.log('🌱 Seeding mock database from CSV files...')

  const dataDir = path.join(__dirname, '..')

  // ==========================================
  // SEED COURIERS
  // ==========================================
  const couriersFile = path.join(dataDir, 'mock_couriers.csv')
  if (fs.existsSync(couriersFile)) {
    console.log('📦 Seeding couriers...')
    const couriersData = parseCSV(fs.readFileSync(couriersFile, 'utf-8'))
    
    for (const row of couriersData) {
      await prisma.mockCourier.upsert({
        where: { id: row.id },
        update: {
          courier_code: row.courier_code,
          courier_name: row.courier_name,
          logo_url: row.logo_url || null,
          is_active: parseBool(row.is_active),
          services: row.services ? JSON.parse(row.services.replace(/'/g, '"')) : null,
        },
        create: {
          id: row.id,
          courier_code: row.courier_code,
          courier_name: row.courier_name,
          logo_url: row.logo_url || null,
          is_active: parseBool(row.is_active),
          services: row.services ? JSON.parse(row.services.replace(/'/g, '"')) : null,
        }
      })
    }
    console.log(`✅ Seeded ${couriersData.length} couriers`)
  } else {
    console.log('⚠️ mock_couriers.csv not found, skipping...')
  }

  // ==========================================
  // SEED SHIPPING RATES
  // ==========================================
  const ratesFile = path.join(dataDir, 'mock_shipping_rates.csv')
  if (fs.existsSync(ratesFile)) {
    console.log('🚚 Seeding shipping rates...')
    const ratesData = parseCSV(fs.readFileSync(ratesFile, 'utf-8'))
    
    for (const row of ratesData) {
      await prisma.mockShippingRate.upsert({
        where: { id: row.id },
        update: {
          courier_id: row.courier_id,
          courier_service_code: row.courier_service_code,
          courier_service_name: row.courier_service_name,
          description: row.description || null,
          duration: row.duration,
          shipment_duration_range: row.shipment_duration_range || null,
          shipment_duration_unit: row.shipment_duration_unit || 'days',
          service_type: row.service_type,
          shipping_type: row.shipping_type || 'parcel',
          base_price: parseInt(row.base_price),
          price_per_km: parseInt(row.price_per_km),
          min_price: row.min_price ? parseInt(row.min_price) : null,
          max_price: row.max_price ? parseInt(row.max_price) : null,
          shipping_fee_discount: parseInt(row.shipping_fee_discount),
          shipping_fee_surcharge: parseInt(row.shipping_fee_surcharge),
          insurance_fee: parseInt(row.insurance_fee),
          cod_fee: parseInt(row.cod_fee),
          available_for_cod: parseBool(row.available_for_cod),
          available_for_pod: parseBool(row.available_for_pod),
          available_for_insurance: parseBool(row.available_for_insurance),
          available_for_instant_waybill: parseBool(row.available_for_instant_waybill),
          collection_method: parseArray(row.collection_method),
          is_active: parseBool(row.is_active),
        },
        create: {
          id: row.id,
          courier_id: row.courier_id,
          courier_service_code: row.courier_service_code,
          courier_service_name: row.courier_service_name,
          description: row.description || null,
          duration: row.duration,
          shipment_duration_range: row.shipment_duration_range || null,
          shipment_duration_unit: row.shipment_duration_unit || 'days',
          service_type: row.service_type,
          shipping_type: row.shipping_type || 'parcel',
          base_price: parseInt(row.base_price),
          price_per_km: parseInt(row.price_per_km),
          min_price: row.min_price ? parseInt(row.min_price) : null,
          max_price: row.max_price ? parseInt(row.max_price) : null,
          shipping_fee_discount: parseInt(row.shipping_fee_discount),
          shipping_fee_surcharge: parseInt(row.shipping_fee_surcharge),
          insurance_fee: parseInt(row.insurance_fee),
          cod_fee: parseInt(row.cod_fee),
          available_for_cod: parseBool(row.available_for_cod),
          available_for_pod: parseBool(row.available_for_pod),
          available_for_insurance: parseBool(row.available_for_insurance),
          available_for_instant_waybill: parseBool(row.available_for_instant_waybill),
          collection_method: parseArray(row.collection_method),
          is_active: parseBool(row.is_active),
        }
      })
    }
    console.log(`✅ Seeded ${ratesData.length} shipping rates`)
  } else {
    console.log('⚠️ mock_shipping_rates.csv not found, skipping...')
  }

  // ==========================================
  // SEED PAYMENT CHANNELS
  // ==========================================
  const channelsFile = path.join(dataDir, 'mock_payment_channels.csv')
  if (fs.existsSync(channelsFile)) {
    console.log('💳 Seeding payment channels...')
    const channelsData = parseCSV(fs.readFileSync(channelsFile, 'utf-8'))
    
    for (const row of channelsData) {
      await prisma.mockPaymentChannel.upsert({
        where: { id: row.id },
        update: {
          channel_code: row.channel_code,
          channel_name: row.channel_name,
          channel_type: row.channel_type,
          logo_url: row.logo_url || null,
          icon_name: row.icon_name || null,
          min_amount: parseInt(row.min_amount),
          max_amount: parseInt(row.max_amount),
          is_active: parseBool(row.is_active),
          display_order: parseInt(row.display_order),
          description: row.description || null,
          instructions: row.instructions || null,
        },
        create: {
          id: row.id,
          channel_code: row.channel_code,
          channel_name: row.channel_name,
          channel_type: row.channel_type,
          logo_url: row.logo_url || null,
          icon_name: row.icon_name || null,
          min_amount: parseInt(row.min_amount),
          max_amount: parseInt(row.max_amount),
          is_active: parseBool(row.is_active),
          display_order: parseInt(row.display_order),
          description: row.description || null,
          instructions: row.instructions || null,
        }
      })
    }
    console.log(`✅ Seeded ${channelsData.length} payment channels`)
  } else {
    console.log('⚠️ mock_payment_channels.csv not found, skipping...')
  }

  console.log('🎉 Seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
