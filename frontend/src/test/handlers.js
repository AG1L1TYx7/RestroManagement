import { http, HttpResponse } from 'msw'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1'

export const handlers = [
  http.get(`${API_BASE_URL}/health`, () => {
    return HttpResponse.json({ status: 'success' })
  }),
  http.post(`${API_BASE_URL}/auth/login`, async ({ request }) => {
    const body = await request.json()
    if (!body?.identifier || !body?.password) {
      return HttpResponse.json({ message: 'Missing credentials' }, { status: 400 })
    }

    if (body.password !== 'password123') {
      return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 })
    }

    return HttpResponse.json({
      success: true,
      data: {
        tokens: {
          accessToken: 'test-token',
        },
        user: {
          user_id: 1,
          full_name: 'Manager Jane',
          role: 'manager',
          email: 'manager@example.com',
        },
      },
    })
  }),
  http.get(`${API_BASE_URL}/analytics/dashboard`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        today: {
          revenue: 1520,
          orders: 42,
          customers: 35,
          average_order_value: 36.19,
        },
        this_week: {
          revenue: 8540,
          orders: 235,
          growth_percentage: 12.5,
        },
        this_month: {
          revenue: 45680.5,
          orders: 1250,
          growth_percentage: 8.3,
        },
        inventory: {
          total_value: 15250.75,
          low_stock_items: 12,
          critical_stock_items: 3,
        },
        top_selling_today: [
          { item_name: 'Chicken Curry', quantity: 15, revenue: 225 },
          { item_name: 'Pasta Primavera', quantity: 12, revenue: 198 },
        ],
        recent_orders: [
          {
            order_id: 1250,
            customer_name: 'John Doe',
            total_amount: 43.2,
            status: 'completed',
            time_ago: '5 minutes ago',
          },
          {
            order_id: 1251,
            customer_name: 'Sofia Perez',
            total_amount: 58.75,
            status: 'preparing',
            time_ago: '12 minutes ago',
          },
        ],
        low_stock_items: [
          { ingredient: 'Fresh Basil', current_stock: 2, unit: 'kg', status: 'critical' },
          { ingredient: 'Olive Oil', current_stock: 5, unit: 'L', status: 'low' },
          { ingredient: 'Parmesan', current_stock: 3, unit: 'kg', status: 'low' },
        ],
        revenue_trend: [
          { date: 'Mon', revenue: 1200 },
          { date: 'Tue', revenue: 1500 },
          { date: 'Wed', revenue: 1320 },
          { date: 'Thu', revenue: 1680 },
          { date: 'Fri', revenue: 1820 },
          { date: 'Sat', revenue: 2100 },
          { date: 'Sun', revenue: 1750 },
        ],
      },
    })
  }),
  http.get(`${API_BASE_URL}/branches`, () => {
    return HttpResponse.json({
      success: true,
      data: [
        { branch_id: 1, branch_name: 'Main Branch', city: 'New York' },
        { branch_id: 2, branch_name: 'Downtown Branch', city: 'Los Angeles' },
        { branch_id: 3, branch_name: 'Northside Branch', city: 'Chicago' },
      ],
    })
  }),
  http.get(`${API_BASE_URL}/orders`, ({ request }) => {
    const url = new URL(request.url)
    const branchId = url.searchParams.get('branchId')
    const status = url.searchParams.getAll('status')
    const customerSearch = url.searchParams.get('customerSearch')
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')

    let orders = [
      {
        order_id: 1201,
        order_date: '2025-12-01T10:30:00.000Z',
        branch_id: 1,
        branch_name: 'Main Branch',
        customer_name: 'John Carter',
        total_amount: 48.5,
        status: 'completed',
      },
      {
        order_id: 1202,
        order_date: '2025-12-01T11:15:00.000Z',
        branch_id: 2,
        branch_name: 'Downtown Branch',
        customer_name: 'Maria Ruiz',
        total_amount: 32.75,
        status: 'preparing',
      },
      {
        order_id: 1203,
        order_date: '2025-12-01T12:00:00.000Z',
        branch_id: 1,
        branch_name: 'Main Branch',
        customer_name: 'David Kim',
        total_amount: 67.2,
        status: 'pending',
      },
      {
        order_id: 1204,
        order_date: '2025-11-30T15:20:00.000Z',
        branch_id: 3,
        branch_name: 'Northside Branch',
        customer_name: 'Emma Watson',
        total_amount: 54.9,
        status: 'completed',
      },
      {
        order_id: 1205,
        order_date: '2025-11-29T13:45:00.000Z',
        branch_id: 2,
        branch_name: 'Downtown Branch',
        customer_name: 'Alex Johnson',
        total_amount: 28.3,
        status: 'cancelled',
      },
    ]

    // Apply filters
    if (branchId) {
      orders = orders.filter((o) => o.branch_id === parseInt(branchId))
    }
    if (status.length > 0) {
      orders = orders.filter((o) => status.includes(o.status))
    }
    if (customerSearch) {
      orders = orders.filter((o) =>
        o.customer_name.toLowerCase().includes(customerSearch.toLowerCase())
      )
    }
    if (startDate) {
      orders = orders.filter((o) => new Date(o.order_date) >= new Date(startDate))
    }
    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999) // End of day
      orders = orders.filter((o) => new Date(o.order_date) <= end)
    }

    return HttpResponse.json({
      success: true,
      data: orders,
      pagination: { page: 1, limit: 20, total: orders.length, totalPages: 1 },
    })
  }),
  http.get(`${API_BASE_URL}/orders/:orderId`, ({ params }) => {
    const orderId = parseInt(params.orderId)
    const orderDetails = {
      1201: {
        order_id: 1201,
        order_date: '2025-12-01T10:30:00.000Z',
        branch_id: 1,
        branch_name: 'Main Branch',
        customer_name: 'John Carter',
        customer_email: 'john.carter@email.com',
        customer_phone: '+1-555-0101',
        total_amount: 48.5,
        status: 'completed',
        notes: 'Customer requested no onions',
        items: [
          { menu_item_name: 'Margherita Pizza', quantity: 2, unit_price: 12.99 },
          { menu_item_name: 'Caesar Salad', quantity: 1, unit_price: 8.99 },
          { menu_item_name: 'Garlic Bread', quantity: 1, unit_price: 4.99 },
          { menu_item_name: 'Iced Tea', quantity: 2, unit_price: 2.99 },
        ],
      },
      1202: {
        order_id: 1202,
        order_date: '2025-12-01T11:15:00.000Z',
        branch_id: 2,
        branch_name: 'Downtown Branch',
        customer_name: 'Maria Ruiz',
        customer_email: 'maria.ruiz@email.com',
        total_amount: 32.75,
        status: 'preparing',
        items: [
          { menu_item_name: 'Chicken Curry', quantity: 1, unit_price: 15.99 },
          { menu_item_name: 'Naan Bread', quantity: 2, unit_price: 3.99 },
          { menu_item_name: 'Mango Lassi', quantity: 2, unit_price: 4.49 },
        ],
      },
      1203: {
        order_id: 1203,
        order_date: '2025-12-01T12:00:00.000Z',
        branch_id: 1,
        branch_name: 'Main Branch',
        customer_name: 'David Kim',
        total_amount: 67.2,
        status: 'pending',
        items: [
          { menu_item_name: 'Ribeye Steak', quantity: 2, unit_price: 28.99 },
          { menu_item_name: 'French Fries', quantity: 2, unit_price: 4.99 },
        ],
      },
    }

    const order = orderDetails[orderId]
    if (!order) {
      return HttpResponse.json({ message: 'Order not found' }, { status: 404 })
    }

    return HttpResponse.json({
      success: true,
      data: order,
    })
  }),
  http.get(`${API_BASE_URL}/suppliers`, () => {
    return HttpResponse.json({
      success: true,
      data: [
        { supplier_id: 1, supplier_name: 'Fresh Farms Co.', contact: 'farms@fresh.com' },
        { supplier_id: 2, supplier_name: 'Daily Dairy', contact: 'info@dailydairy.com' },
        { supplier_id: 3, supplier_name: 'Spice Harbor', contact: 'sales@spiceharbor.com' },
        { supplier_id: 4, supplier_name: 'Metro Meats', contact: 'orders@metromeats.com' },
      ],
    })
  }),
  http.get(`${API_BASE_URL}/inventory`, ({ request }) => {
    const url = new URL(request.url)
    const branchId = url.searchParams.get('branchId')
    const stockStatus = url.searchParams.getAll('stockStatus')
    const ingredientSearch = url.searchParams.get('ingredientSearch')

    let inventory = [
      {
        branch_id: 1,
        branch_name: 'Main Branch',
        ingredient_id: 10,
        ingredient_name: 'Olive Oil',
        quantity_available: 5,
        unit: 'L',
        reorder_level: 10,
        stock_status: 'low',
      },
      {
        branch_id: 1,
        branch_name: 'Main Branch',
        ingredient_id: 12,
        ingredient_name: 'Parmesan',
        quantity_available: 2,
        unit: 'kg',
        reorder_level: 5,
        stock_status: 'critical',
      },
      {
        branch_id: 1,
        branch_name: 'Main Branch',
        ingredient_id: 15,
        ingredient_name: 'Cherry Tomatoes',
        quantity_available: 14,
        unit: 'kg',
        reorder_level: 8,
        stock_status: 'healthy',
      },
      {
        branch_id: 2,
        branch_name: 'Downtown Branch',
        ingredient_id: 10,
        ingredient_name: 'Olive Oil',
        quantity_available: 3,
        unit: 'L',
        reorder_level: 10,
        stock_status: 'critical',
      },
      {
        branch_id: 2,
        branch_name: 'Downtown Branch',
        ingredient_id: 20,
        ingredient_name: 'Fresh Basil',
        quantity_available: 8,
        unit: 'kg',
        reorder_level: 5,
        stock_status: 'healthy',
      },
      {
        branch_id: 3,
        branch_name: 'Northside Branch',
        ingredient_id: 12,
        ingredient_name: 'Parmesan',
        quantity_available: 6,
        unit: 'kg',
        reorder_level: 5,
        stock_status: 'healthy',
      },
    ]

    // Apply filters
    if (branchId) {
      inventory = inventory.filter((item) => item.branch_id === parseInt(branchId))
    }
    if (stockStatus.length > 0) {
      inventory = inventory.filter((item) => stockStatus.includes(item.stock_status))
    }
    if (ingredientSearch) {
      inventory = inventory.filter((item) =>
        item.ingredient_name.toLowerCase().includes(ingredientSearch.toLowerCase())
      )
    }

    return HttpResponse.json({
      success: true,
      data: inventory,
    })
  }),
  http.get(`${API_BASE_URL}/purchase-orders`, ({ request }) => {
    const url = new URL(request.url)
    const branchId = url.searchParams.get('branchId')
    const supplierId = url.searchParams.get('supplierId')
    const status = url.searchParams.getAll('status')
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')

    let purchaseOrders = [
      {
        po_id: 4012,
        branch_id: 1,
        branch_name: 'Main Branch',
        supplier_id: 1,
        supplier_name: 'Fresh Farms Co.',
        po_date: '2025-11-30',
        expected_delivery_date: '2025-12-05',
        total_amount: 1820,
        status: 'approved',
      },
      {
        po_id: 4013,
        branch_id: 2,
        branch_name: 'Downtown Branch',
        supplier_id: 2,
        supplier_name: 'Daily Dairy',
        po_date: '2025-12-01',
        expected_delivery_date: '2025-12-07',
        total_amount: 940,
        status: 'pending',
      },
      {
        po_id: 4014,
        branch_id: 1,
        branch_name: 'Main Branch',
        supplier_id: 3,
        supplier_name: 'Spice Harbor',
        po_date: '2025-11-28',
        expected_delivery_date: '2025-12-03',
        total_amount: 650,
        status: 'received',
      },
      {
        po_id: 4015,
        branch_id: 3,
        branch_name: 'Northside Branch',
        supplier_id: 4,
        supplier_name: 'Metro Meats',
        po_date: '2025-12-02',
        expected_delivery_date: '2025-12-08',
        total_amount: 2150,
        status: 'draft',
      },
      {
        po_id: 4016,
        branch_id: 2,
        branch_name: 'Downtown Branch',
        supplier_id: 1,
        supplier_name: 'Fresh Farms Co.',
        po_date: '2025-11-25',
        expected_delivery_date: '2025-11-30',
        total_amount: 1340,
        status: 'cancelled',
      },
    ]

    // Apply filters
    if (branchId) {
      purchaseOrders = purchaseOrders.filter((po) => po.branch_id === parseInt(branchId))
    }
    if (supplierId) {
      purchaseOrders = purchaseOrders.filter((po) => po.supplier_id === parseInt(supplierId))
    }
    if (status.length > 0) {
      purchaseOrders = purchaseOrders.filter((po) => status.includes(po.status))
    }
    if (startDate) {
      purchaseOrders = purchaseOrders.filter(
        (po) => new Date(po.expected_delivery_date) >= new Date(startDate)
      )
    }
    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      purchaseOrders = purchaseOrders.filter(
        (po) => new Date(po.expected_delivery_date) <= end
      )
    }

    return HttpResponse.json({
      success: true,
      data: purchaseOrders,
    })
  }),
  http.get(`${API_BASE_URL}/purchase-orders/:poId`, ({ params }) => {
    const poId = parseInt(params.poId)
    const poDetails = {
      4012: {
        po_id: 4012,
        branch_id: 1,
        branch_name: 'Main Branch',
        supplier_id: 1,
        supplier_name: 'Fresh Farms Co.',
        supplier_email: 'farms@fresh.com',
        supplier_contact: '+1-555-FARM',
        po_date: '2025-11-30',
        expected_delivery_date: '2025-12-05',
        total_amount: 1820,
        status: 'approved',
        notes: 'Urgent delivery required for weekend rush',
        items: [
          { ingredient_name: 'Tomatoes', quantity: 50, unit: 'kg', unit_price: 3.5 },
          { ingredient_name: 'Lettuce', quantity: 30, unit: 'kg', unit_price: 2.8 },
          { ingredient_name: 'Bell Peppers', quantity: 20, unit: 'kg', unit_price: 4.2 },
          { ingredient_name: 'Onions', quantity: 40, unit: 'kg', unit_price: 1.9 },
        ],
      },
      4013: {
        po_id: 4013,
        branch_id: 2,
        branch_name: 'Downtown Branch',
        supplier_id: 2,
        supplier_name: 'Daily Dairy',
        supplier_email: 'info@dailydairy.com',
        po_date: '2025-12-01',
        expected_delivery_date: '2025-12-07',
        total_amount: 940,
        status: 'pending',
        items: [
          { ingredient_name: 'Mozzarella', quantity: 20, unit: 'kg', unit_price: 12.5 },
          { ingredient_name: 'Cheddar', quantity: 15, unit: 'kg', unit_price: 11.8 },
          { ingredient_name: 'Butter', quantity: 10, unit: 'kg', unit_price: 8.9 },
        ],
      },
      4014: {
        po_id: 4014,
        branch_id: 1,
        branch_name: 'Main Branch',
        supplier_id: 3,
        supplier_name: 'Spice Harbor',
        po_date: '2025-11-28',
        expected_delivery_date: '2025-12-03',
        total_amount: 650,
        status: 'received',
        received_date: '2025-12-03T14:30:00.000Z',
        received_by: 'Manager Jane',
        items: [
          { ingredient_name: 'Black Pepper', quantity: 5, unit: 'kg', unit_price: 45.0 },
          { ingredient_name: 'Oregano', quantity: 3, unit: 'kg', unit_price: 35.0 },
          { ingredient_name: 'Basil', quantity: 4, unit: 'kg', unit_price: 38.0 },
          { ingredient_name: 'Cumin', quantity: 2, unit: 'kg', unit_price: 42.0 },
        ],
      },
    }

    const po = poDetails[poId]
    if (!po) {
      return HttpResponse.json({ message: 'Purchase order not found' }, { status: 404 })
    }

    return HttpResponse.json({
      success: true,
      data: po,
    })
  }),
  http.post(`${API_BASE_URL}/inventory/adjust`, async ({ request }) => {
    const body = await request.json()
    
    // Validate required fields
    if (!body.branchId || !body.ingredientId || !body.adjustmentType || !body.quantity) {
      return HttpResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Simulate successful adjustment
    return HttpResponse.json({
      success: true,
      data: {
        adjustment_id: Math.floor(Math.random() * 10000),
        branch_id: body.branchId,
        ingredient_id: body.ingredientId,
        adjustment_type: body.adjustmentType,
        quantity: body.quantity,
        reason: body.reason,
        adjusted_by: 'Current User',
        adjusted_at: new Date().toISOString(),
      },
    })
  }),
  http.get(`${API_BASE_URL}/menu-items`, ({ request }) => {
    const url = new URL(request.url)
    const category = url.searchParams.get('category')

    let menuItems = [
      { menu_item_id: 1, item_name: 'Margherita Pizza', category: 'Pizza', price: 12.99, available: true },
      { menu_item_id: 2, item_name: 'Pepperoni Pizza', category: 'Pizza', price: 14.99, available: true },
      { menu_item_id: 3, item_name: 'BBQ Chicken Pizza', category: 'Pizza', price: 15.99, available: true },
      { menu_item_id: 4, item_name: 'Caesar Salad', category: 'Salad', price: 8.99, available: true },
      { menu_item_id: 5, item_name: 'Greek Salad', category: 'Salad', price: 9.99, available: true },
      { menu_item_id: 6, item_name: 'Pasta Primavera', category: 'Pasta', price: 13.99, available: true },
      { menu_item_id: 7, item_name: 'Spaghetti Carbonara', category: 'Pasta', price: 14.99, available: true },
      { menu_item_id: 8, item_name: 'Chicken Curry', category: 'Main Course', price: 15.99, available: true },
      { menu_item_id: 9, item_name: 'Ribeye Steak', category: 'Main Course', price: 28.99, available: true },
      { menu_item_id: 10, item_name: 'Grilled Salmon', category: 'Main Course', price: 22.99, available: true },
      { menu_item_id: 11, item_name: 'Garlic Bread', category: 'Appetizer', price: 4.99, available: true },
      { menu_item_id: 12, item_name: 'Mozzarella Sticks', category: 'Appetizer', price: 7.99, available: true },
      { menu_item_id: 13, item_name: 'French Fries', category: 'Side', price: 4.99, available: true },
      { menu_item_id: 14, item_name: 'Naan Bread', category: 'Side', price: 3.99, available: true },
      { menu_item_id: 15, item_name: 'Iced Tea', category: 'Beverage', price: 2.99, available: true },
      { menu_item_id: 16, item_name: 'Mango Lassi', category: 'Beverage', price: 4.49, available: true },
      { menu_item_id: 17, item_name: 'Coca Cola', category: 'Beverage', price: 2.49, available: true },
      { menu_item_id: 18, item_name: 'Chocolate Cake', category: 'Dessert', price: 6.99, available: true },
      { menu_item_id: 19, item_name: 'Tiramisu', category: 'Dessert', price: 7.99, available: true },
      { menu_item_id: 20, item_name: 'Ice Cream', category: 'Dessert', price: 5.99, available: true },
    ]

    if (category) {
      menuItems = menuItems.filter((item) => item.category === category)
    }

    return HttpResponse.json({
      success: true,
      data: menuItems,
    })
  }),
  http.post(`${API_BASE_URL}/orders`, async ({ request }) => {
    const body = await request.json()

    // Validate required fields
    if (!body.customerName || !body.branchId || !body.items || body.items.length === 0) {
      return HttpResponse.json(
        { message: 'Missing required fields (customerName, branchId, items)' },
        { status: 400 }
      )
    }

    // Calculate total from items
    const total = body.items.reduce((sum, item) => sum + (item.unit_price || 0) * item.quantity, 0)

    // Simulate successful order creation
    return HttpResponse.json({
      success: true,
      data: {
        order_id: Math.floor(Math.random() * 10000) + 2000,
        customer_name: body.customerName,
        customer_email: body.customerEmail,
        customer_phone: body.customerPhone,
        branch_id: body.branchId,
        order_date: new Date().toISOString(),
        total_amount: total,
        status: 'pending',
        notes: body.notes,
        items: body.items,
      },
    })
  }),
  http.post(`${API_BASE_URL}/purchase-orders`, async ({ request }) => {
    const body = await request.json()

    // Validate required fields
    if (!body.branchId || !body.supplierId || !body.expectedDeliveryDate || !body.items || body.items.length === 0) {
      return HttpResponse.json(
        { message: 'Missing required fields (branchId, supplierId, expectedDeliveryDate, items)' },
        { status: 400 }
      )
    }

    // Calculate total from items
    const total = body.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

    // Simulate successful PO creation
    return HttpResponse.json({
      success: true,
      data: {
        po_id: Math.floor(Math.random() * 10000) + 5000,
        branch_id: body.branchId,
        supplier_id: body.supplierId,
        po_date: new Date().toISOString().split('T')[0],
        expected_delivery_date: body.expectedDeliveryDate,
        total_amount: total,
        status: 'draft',
        notes: body.notes,
        items: body.items,
      },
    })
  }),
  http.patch(`${API_BASE_URL}/orders/:orderId/status`, async ({ params, request }) => {
    const { orderId } = params
    const body = await request.json()

    if (!body.status) {
      return HttpResponse.json(
        { message: 'Status is required' },
        { status: 400 }
      )
    }

    // Simulate successful status update
    return HttpResponse.json({
      success: true,
      message: `Order status updated to ${body.status}`,
      data: {
        order_id: parseInt(orderId),
        status: body.status,
        updated_at: new Date().toISOString(),
      },
    })
  }),
  http.patch(`${API_BASE_URL}/purchase-orders/:poId/status`, async ({ params, request }) => {
    const { poId } = params
    const body = await request.json()

    if (!body.status) {
      return HttpResponse.json(
        { message: 'Status is required' },
        { status: 400 }
      )
    }

    // Simulate successful PO status update
    return HttpResponse.json({
      success: true,
      message: `Purchase order status updated to ${body.status}`,
      data: {
        po_id: parseInt(poId),
        status: body.status,
        updated_at: new Date().toISOString(),
      },
    })
  }),

  http.post(`${API_BASE_URL}/purchase-orders/:poId/receive`, async ({ params, request }) => {
    const { poId } = params
    const body = await request.json()

    if (!body.items || !Array.isArray(body.items)) {
      return HttpResponse.json(
        { message: 'Items array is required' },
        { status: 400 }
      )
    }

    // Simulate successful delivery receipt
    return HttpResponse.json({
      success: true,
      message: 'Delivery received successfully',
      data: {
        po_id: parseInt(poId),
        status: 'received',
        received_at: new Date().toISOString(),
        items_received: body.items.length,
      },
    })
  }),

  http.get(`${API_BASE_URL}/purchase-orders/auto-generate/preview`, () => {
    // Simulate preview data for auto-generate PO
    return HttpResponse.json({
      success: true,
      data: {
        branch_id: 1,
        suppliers: [
          {
            supplier_id: 1,
            supplier_name: 'Fresh Produce Co.',
            ingredients: [
              {
                ingredient_id: 1,
                ingredient_name: 'Tomatoes',
                branch_name: 'Downtown',
                current_stock: 5,
                reorder_level: 20,
                unit: 'kg',
                unit_price: 3.50,
                suggested_quantity: 25,
              },
              {
                ingredient_id: 2,
                ingredient_name: 'Lettuce',
                branch_name: 'Downtown',
                current_stock: 3,
                reorder_level: 15,
                unit: 'kg',
                unit_price: 2.80,
                suggested_quantity: 20,
              },
            ],
          },
          {
            supplier_id: 2,
            supplier_name: 'Dairy Delight',
            ingredients: [
              {
                ingredient_id: 5,
                ingredient_name: 'Mozzarella',
                branch_name: 'Downtown',
                current_stock: 8,
                reorder_level: 25,
                unit: 'kg',
                unit_price: 11.50,
                suggested_quantity: 30,
              },
            ],
          },
        ],
      },
    })
  }),

  http.post(`${API_BASE_URL}/purchase-orders/auto-generate`, async ({ request }) => {
    const body = await request.json()

    if (!body.purchase_orders || !Array.isArray(body.purchase_orders)) {
      return HttpResponse.json(
        { message: 'Purchase orders array is required' },
        { status: 400 }
      )
    }

    // Simulate successful auto-generation
    return HttpResponse.json({
      success: true,
      message: 'Purchase orders generated successfully',
      data: {
        created_count: body.purchase_orders.length,
        po_ids: body.purchase_orders.map((_, index) => 1000 + index),
      },
    })
  }),

  // Analytics endpoints
  http.get(`${API_BASE_URL}/reports/sales-overview`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        total_revenue: 125680.50,
        total_orders: 1523,
        average_order_value: 82.54,
        revenue_growth: 8.4,
      },
    })
  }),

  http.get(`${API_BASE_URL}/reports/revenue-trends`, () => {
    return HttpResponse.json({
      success: true,
      data: [
        { date: '2024-01-01', revenue: 4200 },
        { date: '2024-01-02', revenue: 4500 },
        { date: '2024-01-03', revenue: 3800 },
        { date: '2024-01-04', revenue: 5100 },
        { date: '2024-01-05', revenue: 4900 },
        { date: '2024-01-06', revenue: 5500 },
        { date: '2024-01-07', revenue: 5200 },
      ],
    })
  }),

  http.get(`${API_BASE_URL}/reports/top-selling-items`, () => {
    return HttpResponse.json({
      success: true,
      data: [
        { item_name: 'Margherita Pizza', quantity_sold: 245, revenue: 3185.50 },
        { item_name: 'Pepperoni Pizza', quantity_sold: 198, revenue: 2871.00 },
        { item_name: 'Caesar Salad', quantity_sold: 156, revenue: 1404.00 },
        { item_name: 'Garlic Bread', quantity_sold: 142, revenue: 781.00 },
        { item_name: 'Tiramisu', quantity_sold: 98, revenue: 637.00 },
      ],
    })
  }),

  http.get(`${API_BASE_URL}/reports/category-performance`, () => {
    return HttpResponse.json({
      success: true,
      data: [
        { category: 'Pizza', revenue: 45680, orders: 512 },
        { category: 'Pasta', revenue: 28450, orders: 324 },
        { category: 'Salads', revenue: 15230, orders: 189 },
        { category: 'Desserts', revenue: 12340, orders: 145 },
        { category: 'Beverages', revenue: 8920, orders: 353 },
      ],
    })
  }),

  http.get(`${API_BASE_URL}/reports/food-cost-ratio`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        current_ratio: 31.2,
        target_ratio: 30.0,
        variance: 1.2,
        total_food_cost: 39234.50,
        total_revenue: 125680.50,
      },
    })
  }),

  http.get(`${API_BASE_URL}/reports/profit-analysis`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        gross_profit: 86446.00,
        net_profit: 42180.25,
        profit_margin: 33.6,
        operating_expenses: 44265.75,
      },
    })
  }),

  // Tables endpoints
  http.get(`${API_BASE_URL}/tables`, () => {
    return HttpResponse.json({
      success: true,
      data: [
        { table_id: 1, table_number: 'T1', capacity: 4, location: 'Main Hall', status: 'available', notes: 'Window seat' },
        { table_id: 2, table_number: 'T2', capacity: 2, location: 'Patio', status: 'occupied', notes: '' },
        { table_id: 3, table_number: 'T3', capacity: 6, location: 'Main Hall', status: 'reserved', notes: 'Birthday party' },
        { table_id: 4, table_number: 'T4', capacity: 4, location: 'VIP Section', status: 'available', notes: '' },
      ],
    })
  }),

  http.get(`${API_BASE_URL}/tables/stats`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        total_tables: 25,
        available_tables: 15,
        occupied_tables: 7,
        reserved_tables: 3,
      },
    })
  }),

  http.post(`${API_BASE_URL}/tables`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({
      success: true,
      data: {
        table_id: Math.floor(Math.random() * 1000) + 100,
        ...body,
        status: 'available',
      },
    })
  }),

  http.put(`${API_BASE_URL}/tables/:tableId`, async ({ params, request }) => {
    const body = await request.json()
    return HttpResponse.json({
      success: true,
      data: {
        table_id: parseInt(params.tableId),
        ...body,
      },
    })
  }),

  http.delete(`${API_BASE_URL}/tables/:tableId`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Table deleted successfully',
    })
  }),

  http.put(`${API_BASE_URL}/tables/:tableId/status`, async ({ params, request }) => {
    const body = await request.json()
    return HttpResponse.json({
      success: true,
      data: {
        table_id: parseInt(params.tableId),
        status: body.status,
      },
    })
  }),

  http.get(`${API_BASE_URL}/tables/available`, () => {
    return HttpResponse.json({
      success: true,
      data: [
        { table_id: 1, table_number: 'T1', capacity: 4, location: 'Main Hall', status: 'available' },
        { table_id: 4, table_number: 'T4', capacity: 4, location: 'VIP Section', status: 'available' },
      ],
    })
  }),

  // Reservations endpoints
  http.get(`${API_BASE_URL}/reservations`, () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          reservation_id: 1,
          customer_name: 'John Doe',
          customer_phone: '+1-555-0101',
          customer_email: 'john@email.com',
          table_id: 3,
          table_number: 'T3',
          reservation_date: '2025-12-05',
          reservation_time: '19:00:00',
          party_size: 6,
          status: 'confirmed',
          special_requests: 'Birthday celebration',
        },
        {
          reservation_id: 2,
          customer_name: 'Jane Smith',
          customer_phone: '+1-555-0102',
          customer_email: 'jane@email.com',
          table_id: 5,
          table_number: 'T5',
          reservation_date: '2025-12-06',
          reservation_time: '20:00:00',
          party_size: 2,
          status: 'pending',
          special_requests: 'Window seat preferred',
        },
      ],
    })
  }),

  http.post(`${API_BASE_URL}/reservations`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({
      success: true,
      data: {
        reservation_id: Math.floor(Math.random() * 1000) + 100,
        ...body,
        status: 'pending',
      },
    })
  }),

  http.put(`${API_BASE_URL}/reservations/:reservationId`, async ({ params, request }) => {
    const body = await request.json()
    return HttpResponse.json({
      success: true,
      data: {
        reservation_id: parseInt(params.reservationId),
        ...body,
      },
    })
  }),

  http.delete(`${API_BASE_URL}/reservations/:reservationId`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Reservation deleted successfully',
    })
  }),

  http.put(`${API_BASE_URL}/reservations/:reservationId/status`, async ({ params, request }) => {
    const body = await request.json()
    return HttpResponse.json({
      success: true,
      data: {
        reservation_id: parseInt(params.reservationId),
        status: body.status,
      },
    })
  }),

  http.delete(`${API_BASE_URL}/reservations/:reservationId/cancel`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Reservation cancelled successfully',
    })
  }),

  http.get(`${API_BASE_URL}/reservations/upcoming`, () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          reservation_id: 1,
          customer_name: 'John Doe',
          table_number: 'T3',
          reservation_date: '2025-12-05',
          reservation_time: '19:00:00',
          party_size: 6,
          status: 'confirmed',
        },
      ],
    })
  }),

  http.get(`${API_BASE_URL}/reservations/stats`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        total_reservations: 48,
        confirmed_reservations: 35,
        pending_reservations: 8,
        cancelled_reservations: 5,
      },
    })
  }),

  // Recipes endpoints
  http.get(`${API_BASE_URL}/recipes`, () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          recipe_id: 1,
          menu_item_id: 1,
          menu_item_name: 'Margherita Pizza',
          ingredient_id: 10,
          ingredient_name: 'Mozzarella',
          quantity_required: 0.2,
          unit: 'kg',
        },
        {
          recipe_id: 2,
          menu_item_id: 1,
          menu_item_name: 'Margherita Pizza',
          ingredient_id: 15,
          ingredient_name: 'Tomato Sauce',
          quantity_required: 0.15,
          unit: 'L',
        },
        {
          recipe_id: 3,
          menu_item_id: 4,
          menu_item_name: 'Caesar Salad',
          ingredient_id: 20,
          ingredient_name: 'Romaine Lettuce',
          quantity_required: 0.25,
          unit: 'kg',
        },
      ],
    })
  }),

  http.post(`${API_BASE_URL}/recipes`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({
      success: true,
      data: {
        recipe_id: Math.floor(Math.random() * 1000) + 100,
        ...body,
      },
    })
  }),

  http.put(`${API_BASE_URL}/recipes/:recipeId`, async ({ params, request }) => {
    const body = await request.json()
    return HttpResponse.json({
      success: true,
      data: {
        recipe_id: parseInt(params.recipeId),
        ...body,
      },
    })
  }),

  http.delete(`${API_BASE_URL}/recipes/:recipeId`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Recipe deleted successfully',
    })
  }),

  http.get(`${API_BASE_URL}/recipes/item/:itemId`, () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          recipe_id: 1,
          ingredient_id: 10,
          ingredient_name: 'Mozzarella',
          quantity_required: 0.2,
          unit: 'kg',
        },
      ],
    })
  }),

  http.get(`${API_BASE_URL}/recipes/ingredient/:ingredientId`, () => {
    return HttpResponse.json({
      success: true,
      data: [
        {
          recipe_id: 1,
          menu_item_id: 1,
          menu_item_name: 'Margherita Pizza',
          quantity_required: 0.2,
        },
      ],
    })
  }),

  http.get(`${API_BASE_URL}/recipes/item/:itemId/availability`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        available: true,
        missing_ingredients: [],
      },
    })
  }),

  http.get(`${API_BASE_URL}/recipes/item/:itemId/cost`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        total_cost: 12.50,
        ingredients: [
          { name: 'Mozzarella', cost: 4.50 },
          { name: 'Tomato Sauce', cost: 2.00 },
        ],
      },
    })
  }),

  // Menu Items CRUD endpoints
  http.post(`${API_BASE_URL}/menu-items`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({
      success: true,
      data: {
        menu_item_id: Math.floor(Math.random() * 1000) + 100,
        ...body,
        available: true,
      },
    })
  }),

  http.put(`${API_BASE_URL}/menu-items/:menuItemId`, async ({ params, request }) => {
    const body = await request.json()
    return HttpResponse.json({
      success: true,
      data: {
        menu_item_id: parseInt(params.menuItemId),
        ...body,
      },
    })
  }),

  http.delete(`${API_BASE_URL}/menu-items/:menuItemId`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Menu item deleted successfully',
    })
  }),

  http.patch(`${API_BASE_URL}/menu-items/:menuItemId/toggle-status`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Menu item status toggled successfully',
    })
  }),

  // Categories endpoints
  http.get(`${API_BASE_URL}/categories`, () => {
    return HttpResponse.json({
      success: true,
      data: [
        { category_id: 1, category_name: 'Pizza', description: 'Various pizza options', is_active: true, item_count: 5 },
        { category_id: 2, category_name: 'Pasta', description: 'Italian pasta dishes', is_active: true, item_count: 3 },
        { category_id: 3, category_name: 'Salads', description: 'Fresh salads', is_active: true, item_count: 4 },
        { category_id: 4, category_name: 'Desserts', description: 'Sweet treats', is_active: true, item_count: 6 },
      ],
    })
  }),

  http.post(`${API_BASE_URL}/categories`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({
      success: true,
      data: {
        category_id: Math.floor(Math.random() * 1000) + 100,
        ...body,
        is_active: true,
        item_count: 0,
      },
    })
  }),

  http.put(`${API_BASE_URL}/categories/:categoryId`, async ({ params, request }) => {
    const body = await request.json()
    return HttpResponse.json({
      success: true,
      data: {
        category_id: parseInt(params.categoryId),
        ...body,
      },
    })
  }),

  http.delete(`${API_BASE_URL}/categories/:categoryId`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Category deleted successfully',
    })
  }),

  http.patch(`${API_BASE_URL}/categories/:categoryId/toggle-status`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Category status toggled successfully',
    })
  }),

  // Suppliers CRUD endpoints (adding to existing GET)
  http.post(`${API_BASE_URL}/suppliers`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({
      success: true,
      data: {
        supplier_id: Math.floor(Math.random() * 1000) + 100,
        ...body,
      },
    })
  }),

  http.put(`${API_BASE_URL}/suppliers/:supplierId`, async ({ params, request }) => {
    const body = await request.json()
    return HttpResponse.json({
      success: true,
      data: {
        supplier_id: parseInt(params.supplierId),
        ...body,
      },
    })
  }),

  http.delete(`${API_BASE_URL}/suppliers/:supplierId`, () => {
    return HttpResponse.json({
      success: true,
      message: 'Supplier deleted successfully',
    })
  }),
]
