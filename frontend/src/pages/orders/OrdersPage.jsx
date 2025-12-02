import { useState } from 'react'
import { Alert, Badge, Button, Card, Table } from 'react-bootstrap'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { useOrders } from '../../hooks/useOrders'
import { useBranches } from '../../hooks/useBranches'
import { getOrderById, createOrder, updateOrderStatus } from '../../services/ordersService'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import OrdersFilter from '../../components/filters/OrdersFilter'
import OrderDetailModal from '../../components/modals/OrderDetailModal'
import CreateOrderModal from '../../components/modals/CreateOrderModal'
import { formatCurrency } from '../../utils/formatters'
import { exportToCSV, formatDateForCSV, formatCurrencyForCSV } from '../../utils/exportToCSV'

const statusVariant = {
  completed: 'success',
  preparing: 'warning',
  pending: 'info',
  cancelled: 'danger',
}

const OrdersPage = () => {
  const [filters, setFilters] = useState({})
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  
  const queryClient = useQueryClient()
  const { data: orders = [], isLoading, isError, error, refetch } = useOrders(filters)
  const { data: branches = [] } = useBranches()
  
  const { data: selectedOrder } = useQuery({
    queryKey: ['order', selectedOrderId],
    queryFn: () => getOrderById(selectedOrderId),
    enabled: !!selectedOrderId,
  })

  const createOrderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      setShowCreateModal(false)
      toast.success('Order created successfully')
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to create order')
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }) => updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['order', selectedOrderId] })
      toast.success('Order status updated successfully')
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to update order status')
    },
  })

  const handleRowClick = (orderId) => {
    setSelectedOrderId(orderId)
    setShowDetailModal(true)
  }

  const handleCloseModal = () => {
    setShowDetailModal(false)
    setSelectedOrderId(null)
  }

  const handleOpenCreateModal = () => {
    setShowCreateModal(true)
  }

  const handleCloseCreateModal = () => {
    setShowCreateModal(false)
  }

  const handleCreateOrder = async (orderData) => {
    await createOrderMutation.mutateAsync(orderData)
  }

  const handleStatusUpdate = async (orderId, status) => {
    await updateStatusMutation.mutateAsync({ orderId, status })
  }

  const handleExportCSV = () => {
    const columns = [
      { key: 'order_id', header: 'Order ID' },
      { key: 'customer_name', header: 'Customer Name' },
      { key: 'customer_email', header: 'Email' },
      { key: 'customer_phone', header: 'Phone' },
      { key: 'branch_name', header: 'Branch' },
      { key: 'order_date', header: 'Order Date' },
      { key: 'total_amount', header: 'Total Amount' },
      { key: 'status', header: 'Status' },
    ]

    const exportData = orders.map((order) => ({
      ...order,
      order_date: formatDateForCSV(order.order_date),
      total_amount: formatCurrencyForCSV(order.total_amount),
    }))

    exportToCSV(exportData, `orders-${new Date().toISOString().split('T')[0]}`, columns)
    toast.success('Orders exported successfully')
  }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <LoadingSpinner label="Loading orders" />
      </div>
    )
  }

  if (isError) {
    return (
      <Alert variant="danger" className="d-flex justify-content-between align-items-center">
        <div>
          <h6 className="fw-semibold mb-1">Unable to load orders</h6>
          <p className="mb-0 small">{error?.message || 'Please check your connection and try again.'}</p>
        </div>
        <Button variant="outline-danger" onClick={() => refetch()}>
          Retry
        </Button>
      </Alert>
    )
  }

  return (
    <div className="d-flex flex-column gap-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h2 className="fw-semibold mb-1">Orders</h2>
          <p className="text-muted mb-0">Track customer orders and fulfillment status.</p>
        </div>
        <Button onClick={handleOpenCreateModal}>Add order</Button>
      </div>

      <OrdersFilter onFilterChange={setFilters} branches={branches} />

      <Card className="border-0 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 className="mb-0">Recent orders</h5>
              <small className="text-muted">{orders.length} orders found</small>
            </div>
            <Button variant="outline-secondary" size="sm" onClick={handleExportCSV}>
              Export CSV
            </Button>
          </div>
          <Table responsive hover className="mb-0">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Branch</th>
                <th className="text-end">Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center text-muted py-4">
                    No orders found
                  </td>
                </tr>
              )}
              {orders.map((order) => (
                <tr 
                  key={order.order_id} 
                  onClick={() => handleRowClick(order.order_id)}
                  style={{ cursor: 'pointer' }}
                >
                  <td className="fw-semibold">#{order.order_id}</td>
                  <td>{order.customer_name}</td>
                  <td>{order.branch_name}</td>
                  <td className="text-end">{formatCurrency(order.total_amount, { maximumFractionDigits: 2 })}</td>
                  <td>
                    <Badge bg={statusVariant[order.status] || 'secondary'} className="text-capitalize">
                      {order.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <OrderDetailModal
        show={showDetailModal}
        onHide={handleCloseModal}
        order={selectedOrder}
        onStatusUpdate={handleStatusUpdate}
        isUpdatingStatus={updateStatusMutation.isPending}
      />

      <CreateOrderModal
        show={showCreateModal}
        onHide={handleCloseCreateModal}
        branches={branches}
        onSubmit={handleCreateOrder}
      />
    </div>
  )
}

export default OrdersPage
