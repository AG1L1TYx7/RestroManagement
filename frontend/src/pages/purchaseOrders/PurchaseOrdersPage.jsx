import { useState } from 'react'
import { Alert, Badge, Button, Card, Table } from 'react-bootstrap'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { usePurchaseOrders } from '../../hooks/usePurchaseOrders'
import { useBranches } from '../../hooks/useBranches'
import { useSuppliers } from '../../hooks/useSuppliers'
import { getPurchaseOrderById, createPurchaseOrder, updatePurchaseOrderStatus, receivePurchaseOrder, autoGeneratePurchaseOrders } from '../../services/purchaseOrdersService'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import PurchaseOrdersFilter from '../../components/filters/PurchaseOrdersFilter'
import PurchaseOrderDetailModal from '../../components/modals/PurchaseOrderDetailModal'
import CreatePurchaseOrderModal from '../../components/modals/CreatePurchaseOrderModal'
import ReceiveDeliveryModal from '../../components/modals/ReceiveDeliveryModal'
import AutoGeneratePOModal from '../../components/modals/AutoGeneratePOModal'
import { formatCurrency } from '../../utils/formatters'
import { exportToCSV, formatDateForCSV, formatCurrencyForCSV } from '../../utils/exportToCSV'

const statusVariant = {
  draft: 'secondary',
  pending: 'warning',
  approved: 'info',
  received: 'success',
  cancelled: 'danger',
}

const PurchaseOrdersPage = () => {
  const [filters, setFilters] = useState({})
  const [selectedPoId, setSelectedPoId] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showReceiveModal, setShowReceiveModal] = useState(false)
  const [showAutoGenerateModal, setShowAutoGenerateModal] = useState(false)
  
  const queryClient = useQueryClient()
  const { data: purchaseOrders = [], isLoading, isError, error, refetch } = usePurchaseOrders(filters)
  const { data: branches = [] } = useBranches()
  const { data: suppliers = [] } = useSuppliers()

  const { data: selectedPo } = useQuery({
    queryKey: ['purchase-order', selectedPoId],
    queryFn: () => getPurchaseOrderById(selectedPoId),
    enabled: !!selectedPoId,
  })

  const createPOMutation = useMutation({
    mutationFn: createPurchaseOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      setShowCreateModal(false)
      toast.success('Purchase order created successfully')
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to create purchase order')
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ poId, status }) => updatePurchaseOrderStatus(poId, status),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      queryClient.invalidateQueries({ queryKey: ['purchase-order', selectedPoId] })
      const statusMessages = {
        submitted: 'Purchase order submitted for approval',
        approved: 'Purchase order approved successfully',
        received: 'Delivery received successfully',
      }
      toast.success(statusMessages[variables.status] || 'Purchase order updated')
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to update purchase order')
    },
  })

  const receiveDeliveryMutation = useMutation({
    mutationFn: ({ poId, lineItems }) => receivePurchaseOrder(poId, lineItems),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      queryClient.invalidateQueries({ queryKey: ['purchase-order', selectedPoId] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      setShowReceiveModal(false)
      setShowDetailModal(false)
      toast.success('Delivery received successfully')
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to receive delivery')
    },
  })

  const autoGenerateMutation = useMutation({
    mutationFn: autoGeneratePurchaseOrders,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      setShowAutoGenerateModal(false)
      const count = data?.data?.created_count || 0
      toast.success(`Successfully generated ${count} purchase order(s)`)
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to generate purchase orders')
    },
  })

  const handleRowClick = (poId) => {
    setSelectedPoId(poId)
    setShowDetailModal(true)
  }

  const handleCloseModal = () => {
    setShowDetailModal(false)
    setSelectedPoId(null)
  }

  const handleReceiveDelivery = () => {
    setShowDetailModal(false)
    setShowReceiveModal(true)
  }

  const handleCloseReceiveModal = () => {
    setShowReceiveModal(false)
  }

  const handleReceiveSubmit = async (receivingData) => {
    await receiveDeliveryMutation.mutateAsync({
      poId: receivingData.po_id,
      lineItems: receivingData.line_items,
    })
  }

  const handleExportCSV = () => {
    const columns = [
      { key: 'po_id', header: 'PO ID' },
      { key: 'branch_name', header: 'Branch' },
      { key: 'supplier_name', header: 'Supplier' },
      { key: 'order_date', header: 'Order Date' },
      { key: 'expected_delivery_date', header: 'Expected Delivery' },
      { key: 'total_amount', header: 'Total Amount' },
      { key: 'status', header: 'Status' },
    ]

    const exportData = purchaseOrders.map((po) => ({
      ...po,
      order_date: formatDateForCSV(po.order_date),
      expected_delivery_date: formatDateForCSV(po.expected_delivery_date),
      total_amount: formatCurrencyForCSV(po.total_amount),
    }))

    exportToCSV(exportData, `purchase-orders-${new Date().toISOString().split('T')[0]}`, columns)
    toast.success('Purchase orders exported successfully')
  }

  const handleOpenAutoGenerateModal = () => {
    setShowAutoGenerateModal(true)
  }

  const handleCloseAutoGenerateModal = () => {
    setShowAutoGenerateModal(false)
  }

  const handleAutoGenerate = async (posData) => {
    await autoGenerateMutation.mutateAsync(posData)
  }

  const handleOpenCreateModal = () => {
    setShowCreateModal(true)
  }

  const handleCloseCreateModal = () => {
    setShowCreateModal(false)
  }

  const handleCreatePO = async (poData) => {
    await createPOMutation.mutateAsync(poData)
  }

  const handleSubmitPO = async (poId) => {
    await updateStatusMutation.mutateAsync({ poId, status: 'submitted' })
  }

  const handleApprovePO = async (poId) => {
    await updateStatusMutation.mutateAsync({ poId, status: 'approved' })
  }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <LoadingSpinner label="Loading purchase orders" />
      </div>
    )
  }

  if (isError) {
    return (
      <Alert variant="danger" className="d-flex justify-content-between align-items-center">
        <div>
          <h6 className="fw-semibold mb-1">Unable to load purchase orders</h6>
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
          <h2 className="fw-semibold mb-1">Purchase orders</h2>
          <p className="text-muted mb-0">Coordinate with suppliers and monitor deliveries.</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-primary" onClick={handleOpenAutoGenerateModal}>
            Auto-generate PO
          </Button>
          <Button onClick={handleOpenCreateModal}>Create PO</Button>
        </div>
      </div>

      <PurchaseOrdersFilter onFilterChange={setFilters} branches={branches} suppliers={suppliers} />

      <Card className="border-0 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 className="mb-0">Open purchase orders</h5>
              <small className="text-muted">{Array.isArray(purchaseOrders) ? purchaseOrders.length : 0} purchase orders found</small>
            </div>
            <Button variant="outline-secondary" size="sm" onClick={handleExportCSV}>
              Export CSV
            </Button>
          </div>
          <Table responsive hover className="mb-0">
            <thead>
              <tr>
                <th>PO #</th>
                <th>Branch</th>
                <th>Supplier</th>
                <th>Expected</th>
                <th className="text-end">Value</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(!Array.isArray(purchaseOrders) || purchaseOrders.length === 0) && (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-4">
                    No purchase orders found
                  </td>
                </tr>
              )}
              {Array.isArray(purchaseOrders) && purchaseOrders.map((po) => (
                <tr 
                  key={po.po_id}
                  onClick={() => handleRowClick(po.po_id)}
                  style={{ cursor: 'pointer' }}
                >
                  <td className="fw-semibold">PO-{po.po_id}</td>
                  <td>{po.branch_name}</td>
                  <td>{po.supplier_name}</td>
                  <td>{new Date(po.expected_delivery_date).toLocaleDateString()}</td>
                  <td className="text-end">{formatCurrency(po.total_amount, { maximumFractionDigits: 2 })}</td>
                  <td>
                    <Badge bg={statusVariant[po.status] || 'secondary'} className="text-capitalize">
                      {po.status.replace('_', ' ')}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <PurchaseOrderDetailModal
        show={showDetailModal}
        onHide={handleCloseModal}
        purchaseOrder={selectedPo}
        onSubmit={handleSubmitPO}
        onApprove={handleApprovePO}
        onReceive={handleReceiveDelivery}
        isUpdating={updateStatusMutation.isPending}
      />

      <CreatePurchaseOrderModal
        show={showCreateModal}
        onHide={handleCloseCreateModal}
        branches={branches}
        onSubmit={handleCreatePO}
      />

      <ReceiveDeliveryModal
        show={showReceiveModal}
        onHide={handleCloseReceiveModal}
        purchaseOrder={selectedPo}
        onSubmit={handleReceiveSubmit}
      />

      <AutoGeneratePOModal
        show={showAutoGenerateModal}
        onHide={handleCloseAutoGenerateModal}
        onGenerate={handleAutoGenerate}
        isGenerating={autoGenerateMutation.isPending}
      />
    </div>
  )
}

export default PurchaseOrdersPage
