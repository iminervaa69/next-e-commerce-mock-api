import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ==========================================
// COURIERS DATA
// ==========================================
const couriers = [
  { id: 'cmi40ipxt0003a9u8e6kanb4m', courier_code: 'jne', courier_name: 'JNE', logo_url: '/uploads/courier-logos/jne.svg', services: ['reg', 'yes', 'oke', 'jtr'] },
  { id: 'cmi40iq1i000ia9u85zin1jb6', courier_code: 'lalamove', courier_name: 'Lalamove', logo_url: '/uploads/courier-logos/lalamove.svg', services: ['motorcycle', 'mpv', 'van', 'truck'] },
  { id: 'cmi40ipym0006a9u8hirs9ivj', courier_code: 'lion', courier_name: 'Lion', logo_url: '/uploads/courier-logos/lion.svg', services: ['reg_pack', 'big_pack'] },
  { id: 'cmi40ipy50005a9u805e46xyb', courier_code: 'ninja', courier_name: 'Ninja', logo_url: '/uploads/courier-logos/ninja.svg', services: ['standard'] },
  { id: 'cmi40ipzn000ca9u89mbhgkfd', courier_code: 'wahana', courier_name: 'Wahana', logo_url: '/uploads/courier-logos/wahana.png', services: ['deno'] },
  { id: 'cmi40ipy00004a9u8jvjvt5qt', courier_code: 'tiki', courier_name: 'TIKI', logo_url: '/uploads/courier-logos/tiki.svg', services: ['eko', 'sds', 'reg', 'ons'] },
  { id: 'cmi40ipyz0007a9u8rshewjmp', courier_code: 'sicepat', courier_name: 'SiCepat', logo_url: '/uploads/courier-logos/sicepat.svg', services: ['reg', 'best', 'sds', 'gokil'] },
  { id: 'cmi40ipz30008a9u8uk50zvd1', courier_code: 'sentralcargo', courier_name: 'Sentral Cargo', logo_url: '/uploads/courier-logos/sentralcargo.png', services: ['land_electronic', 'air_electronic'] },
  { id: 'cmi40ipzt000ea9u8fwnyjad7', courier_code: 'anteraja', courier_name: 'Anteraja', logo_url: '/uploads/courier-logos/anteraja.svg', services: ['reg', 'same_day', 'next_day'] },
  { id: 'cmi40iq1d000ha9u82jkpkp35', courier_code: 'borzo', courier_name: 'Borzo', logo_url: '/uploads/courier-logos/borzo.svg', services: ['instant_bike', 'instant_car'] },
  { id: 'cmi40iq1l000ja9u8zw599e9k', courier_code: 'dash_express', courier_name: 'Dash Express', logo_url: '/uploads/courier-logos/dash.png', services: ['SAME_DAY'] },
  { id: 'cmi40ipxp0002a9u87skwncbd', courier_code: 'deliveree', courier_name: 'Deliveree', logo_url: '/uploads/courier-logos/deliveree.png', services: ['van', 'economy', 'cdd_box'] },
  { id: 'cmi40ipxa0000a9u8n0rsx0an', courier_code: 'gojek', courier_name: 'Gojek', logo_url: '/uploads/courier-logos/gojek.svg', services: ['instant', 'same_day'] },
  { id: 'cmi40ipxl0001a9u84sq0s6jo', courier_code: 'grab', courier_name: 'Grab', logo_url: '/uploads/courier-logos/grab.svg', services: ['instant', 'same_day', 'instant_car'] },
  { id: 'cmi40ipzg000aa9u82dc2qw83', courier_code: 'idexpress', courier_name: 'IDexpress', logo_url: '/uploads/courier-logos/idexpress.svg', services: ['reg', 'smd', 'idtruck'] },
  { id: 'cmi40ipzd0009a9u87h5u89ce', courier_code: 'jnt', courier_name: 'J&T', logo_url: '/uploads/courier-logos/jnt.svg', services: ['ez'] },
  { id: 'cmi40iq0j000fa9u8afzdyej9', courier_code: 'sap', courier_name: 'SAP', logo_url: '/uploads/courier-logos/sap.svg', services: ['reg', 'ods', 'sds', 'cargo'] },
  { id: 'cmi40ipzj000ba9u8vasclirb', courier_code: 'rpx', courier_name: 'RPX', logo_url: '/uploads/courier-logos/rpx.svg', services: ['sdp', 'mdp', 'ndp', 'rgp'] },
  { id: 'cmi40ipzq000da9u8gj87tpny', courier_code: 'pos', courier_name: 'Pos Indonesia', logo_url: '/uploads/courier-logos/pos.png', services: ['sameday', 'nextday', 'reg', 'cargo'] },
  { id: 'cmi40iq0n000ga9u8kyyjmrp5', courier_code: 'paxel', courier_name: 'Paxel', logo_url: '/uploads/courier-logos/paxel.svg', services: ['small', 'medium', 'large'] },
]

// ==========================================
// SHIPPING RATES DATA
// ==========================================
const shippingRates = [
  // Anteraja
  { id: 'rate001', courier_id: 'cmi40ipzt000ea9u8fwnyjad7', courier_service_code: 'same_day', courier_service_name: 'Same Day', description: 'Anteraja - Same Day', duration: '1 hari', shipment_duration_range: '24', service_type: 'standard', base_price: 10000, price_per_km: 2000 },
  { id: 'rate002', courier_id: 'cmi40ipzt000ea9u8fwnyjad7', courier_service_code: 'next_day', courier_service_name: 'Next Day', description: 'Anteraja - Next Day', duration: '1-2 hari', shipment_duration_range: '24-48', service_type: 'standard', base_price: 8000, price_per_km: 1800 },
  { id: 'rate003', courier_id: 'cmi40ipzt000ea9u8fwnyjad7', courier_service_code: 'reg', courier_service_name: 'Reguler', description: 'Anteraja - Reguler', duration: '2-3 hari', shipment_duration_range: '48-72', service_type: 'standard', base_price: 7000, price_per_km: 500 },
  // JNE
  { id: 'rate004', courier_id: 'cmi40ipxt0003a9u8e6kanb4m', courier_service_code: 'reg', courier_service_name: 'Reguler', description: 'JNE - Reguler', duration: '1-2 hari', shipment_duration_range: '24-48', service_type: 'standard', base_price: 6000, price_per_km: 400 },
  { id: 'rate005', courier_id: 'cmi40ipxt0003a9u8e6kanb4m', courier_service_code: 'yes', courier_service_name: 'YES', description: 'JNE - YES', duration: '1 hari', shipment_duration_range: '24', service_type: 'standard', base_price: 9000, price_per_km: 550 },
  { id: 'rate006', courier_id: 'cmi40ipxt0003a9u8e6kanb4m', courier_service_code: 'oke', courier_service_name: 'OKE', description: 'JNE - OKE', duration: '1-2 hari', shipment_duration_range: '24-48', service_type: 'standard', base_price: 7500, price_per_km: 480 },
  // SiCepat
  { id: 'rate007', courier_id: 'cmi40ipyz0007a9u8rshewjmp', courier_service_code: 'reg', courier_service_name: 'Reguler', description: 'SiCepat - Reguler', duration: '1 hari', shipment_duration_range: '24', service_type: 'standard', base_price: 9000, price_per_km: 550 },
  { id: 'rate008', courier_id: 'cmi40ipyz0007a9u8rshewjmp', courier_service_code: 'best', courier_service_name: 'Best', description: 'SiCepat - Best', duration: '1 hari', shipment_duration_range: '24', service_type: 'standard', base_price: 8500, price_per_km: 520 },
  { id: 'rate009', courier_id: 'cmi40ipyz0007a9u8rshewjmp', courier_service_code: 'gokil', courier_service_name: 'GOKIL', description: 'SiCepat - GOKIL', duration: '1 hari', shipment_duration_range: '24', service_type: 'standard', base_price: 9000, price_per_km: 550 },
  // J&T
  { id: 'rate010', courier_id: 'cmi40ipzd0009a9u87h5u89ce', courier_service_code: 'ez', courier_service_name: 'EZ', description: 'J&T - EZ', duration: '2-3 hari', shipment_duration_range: '48-72', service_type: 'standard', base_price: 7000, price_per_km: 450 },
  // Gojek
  { id: 'rate011', courier_id: 'cmi40ipxa0000a9u8n0rsx0an', courier_service_code: 'instant', courier_service_name: 'Instant', description: 'Gojek - Instant', duration: '3-6 jam', shipment_duration_range: '3-6', service_type: 'standard', base_price: 15000, price_per_km: 2500 },
  { id: 'rate012', courier_id: 'cmi40ipxa0000a9u8n0rsx0an', courier_service_code: 'same_day', courier_service_name: 'Same Day', description: 'Gojek - Same Day', duration: '4-8 jam', shipment_duration_range: '3-6', service_type: 'standard', base_price: 12000, price_per_km: 2200 },
  // Grab
  { id: 'rate013', courier_id: 'cmi40ipxl0001a9u84sq0s6jo', courier_service_code: 'instant', courier_service_name: 'Instant', description: 'Grab - Instant', duration: '3-6 jam', shipment_duration_range: '3-6', service_type: 'standard', base_price: 10000, price_per_km: 2000 },
  { id: 'rate014', courier_id: 'cmi40ipxl0001a9u84sq0s6jo', courier_service_code: 'same_day', courier_service_name: 'Same Day', description: 'Grab - Same Day', duration: '4-8 jam', shipment_duration_range: '3-6', service_type: 'standard', base_price: 12000, price_per_km: 2200 },
  // TIKI
  { id: 'rate015', courier_id: 'cmi40ipy00004a9u8jvjvt5qt', courier_service_code: 'reg', courier_service_name: 'REG', description: 'TIKI - REG', duration: '1-2 hari', shipment_duration_range: '24-48', service_type: 'standard', base_price: 7000, price_per_km: 450 },
  { id: 'rate016', courier_id: 'cmi40ipy00004a9u8jvjvt5qt', courier_service_code: 'ons', courier_service_name: 'ONS', description: 'TIKI - ONS', duration: '1-2 hari', shipment_duration_range: '24-48', service_type: 'standard', base_price: 8500, price_per_km: 520 },
  // Pos Indonesia
  { id: 'rate017', courier_id: 'cmi40ipzq000da9u8gj87tpny', courier_service_code: 'reg', courier_service_name: 'Pos Reguler', description: 'Pos Indonesia - Reguler', duration: '1 hari', shipment_duration_range: '24', service_type: 'standard', base_price: 9000, price_per_km: 550 },
  { id: 'rate018', courier_id: 'cmi40ipzq000da9u8gj87tpny', courier_service_code: 'sameday', courier_service_name: 'Pos Sameday', description: 'Pos Indonesia - Sameday', duration: '1-2 hari', shipment_duration_range: '24-48', service_type: 'standard', base_price: 7500, price_per_km: 480 },
  // IDexpress
  { id: 'rate019', courier_id: 'cmi40ipzg000aa9u82dc2qw83', courier_service_code: 'reg', courier_service_name: 'Reguler', description: 'IDexpress - Reguler', duration: '4-8 jam', shipment_duration_range: '4-8', service_type: 'standard', base_price: 10000, price_per_km: 2500 },
  { id: 'rate020', courier_id: 'cmi40ipzg000aa9u82dc2qw83', courier_service_code: 'smd', courier_service_name: 'Same Day', description: 'IDexpress - Same Day', duration: '2-3 hari', shipment_duration_range: '48-72', service_type: 'standard', base_price: 9000, price_per_km: 2000 },
]

// ==========================================
// PAYMENT CHANNELS DATA
// ==========================================
const paymentChannels = [
  { id: 'pay001', channel_code: 'QRIS', channel_name: 'QRIS', channel_type: 'QR_CODE', icon_name: 'QrCode', min_amount: 1500, max_amount: 10000000, display_order: 1, description: 'Scan QR untuk bayar' },
  { id: 'pay002', channel_code: 'OVO', channel_name: 'OVO', channel_type: 'EWALLET', icon_name: 'Wallet', min_amount: 1000, max_amount: 10000000, display_order: 10, description: 'Bayar dengan OVO' },
  { id: 'pay003', channel_code: 'DANA', channel_name: 'DANA', channel_type: 'EWALLET', icon_name: 'Wallet', min_amount: 1000, max_amount: 10000000, display_order: 11, description: 'Bayar dengan DANA' },
  { id: 'pay004', channel_code: 'GOPAY', channel_name: 'GoPay', channel_type: 'EWALLET', icon_name: 'Wallet', min_amount: 1000, max_amount: 10000000, display_order: 12, description: 'Bayar dengan GoPay' },
  { id: 'pay005', channel_code: 'SHOPEEPAY', channel_name: 'ShopeePay', channel_type: 'EWALLET', icon_name: 'Wallet', min_amount: 1000, max_amount: 10000000, display_order: 13, description: 'Bayar dengan ShopeePay' },
  { id: 'pay006', channel_code: 'BCA_VIRTUAL_ACCOUNT', channel_name: 'BCA Virtual Account', channel_type: 'VIRTUAL_ACCOUNT', icon_name: 'Building2', min_amount: 10000, max_amount: 999999999, display_order: 20, description: 'Transfer via BCA' },
  { id: 'pay007', channel_code: 'BNI_VIRTUAL_ACCOUNT', channel_name: 'BNI Virtual Account', channel_type: 'VIRTUAL_ACCOUNT', icon_name: 'Building2', min_amount: 10000, max_amount: 999999999, display_order: 21, description: 'Transfer via BNI' },
  { id: 'pay008', channel_code: 'BRI_VIRTUAL_ACCOUNT', channel_name: 'BRI Virtual Account', channel_type: 'VIRTUAL_ACCOUNT', icon_name: 'Building2', min_amount: 10000, max_amount: 999999999, display_order: 22, description: 'Transfer via BRI' },
  { id: 'pay009', channel_code: 'MANDIRI_VIRTUAL_ACCOUNT', channel_name: 'Mandiri Virtual Account', channel_type: 'VIRTUAL_ACCOUNT', icon_name: 'Building2', min_amount: 10000, max_amount: 999999999, display_order: 23, description: 'Transfer via Mandiri' },
  { id: 'pay010', channel_code: 'ALFAMART', channel_name: 'Alfamart', channel_type: 'RETAIL_OUTLET', icon_name: 'Store', min_amount: 10000, max_amount: 5000000, display_order: 30, description: 'Bayar di Alfamart' },
  { id: 'pay011', channel_code: 'INDOMARET', channel_name: 'Indomaret', channel_type: 'RETAIL_OUTLET', icon_name: 'Store', min_amount: 10000, max_amount: 5000000, display_order: 31, description: 'Bayar di Indomaret' },
  { id: 'pay012', channel_code: 'KREDIVO', channel_name: 'Kredivo', channel_type: 'PAYLATER', icon_name: 'CreditCard', min_amount: 50000, max_amount: 30000000, display_order: 40, description: 'Cicilan dengan Kredivo' },
  { id: 'pay013', channel_code: 'CREDIT_CARD', channel_name: 'Kartu Kredit / Debit', channel_type: 'CARD', icon_name: 'CreditCard', min_amount: 10000, max_amount: 999999999, display_order: 50, description: 'Bayar dengan kartu' },
]

// ==========================================
// MAIN SEED FUNCTION
// ==========================================
async function main() {
  console.log('🌱 Seeding mock database...')

  // Seed Couriers
  console.log('📦 Seeding couriers...')
  for (const c of couriers) {
    await prisma.mockCourier.upsert({
      where: { courier_code: c.courier_code },
      update: { courier_name: c.courier_name, logo_url: c.logo_url, services: c.services, is_active: true },
      create: { id: c.id, courier_code: c.courier_code, courier_name: c.courier_name, logo_url: c.logo_url, services: c.services, is_active: true }
    })
  }
  console.log(`✅ Seeded ${couriers.length} couriers`)

  // Seed Shipping Rates
  console.log('🚚 Seeding shipping rates...')
  for (const r of shippingRates) {
    await prisma.mockShippingRate.upsert({
      where: { id: r.id },
      update: {
        courier_id: r.courier_id,
        courier_service_code: r.courier_service_code,
        courier_service_name: r.courier_service_name,
        description: r.description,
        duration: r.duration,
        shipment_duration_range: r.shipment_duration_range,
        service_type: r.service_type,
        base_price: r.base_price,
        price_per_km: r.price_per_km,
        is_active: true
      },
      create: {
        id: r.id,
        courier_id: r.courier_id,
        courier_service_code: r.courier_service_code,
        courier_service_name: r.courier_service_name,
        description: r.description,
        duration: r.duration,
        shipment_duration_range: r.shipment_duration_range,
        service_type: r.service_type,
        base_price: r.base_price,
        price_per_km: r.price_per_km,
        is_active: true
      }
    })
  }
  console.log(`✅ Seeded ${shippingRates.length} shipping rates`)

  // Seed Payment Channels
  console.log('💳 Seeding payment channels...')
  for (const p of paymentChannels) {
    await prisma.mockPaymentChannel.upsert({
      where: { channel_code: p.channel_code },
      update: {
        channel_name: p.channel_name,
        channel_type: p.channel_type,
        icon_name: p.icon_name,
        min_amount: p.min_amount,
        max_amount: p.max_amount,
        display_order: p.display_order,
        description: p.description,
        is_active: true
      },
      create: {
        id: p.id,
        channel_code: p.channel_code,
        channel_name: p.channel_name,
        channel_type: p.channel_type,
        icon_name: p.icon_name,
        min_amount: p.min_amount,
        max_amount: p.max_amount,
        display_order: p.display_order,
        description: p.description,
        is_active: true
      }
    })
  }
  console.log(`✅ Seeded ${paymentChannels.length} payment channels`)

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
