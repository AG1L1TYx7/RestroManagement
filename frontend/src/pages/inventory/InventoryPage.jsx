import { useState } from 'react'
import { Alert, Badge, Button, Card, Table } from 'react-bootstrap'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { useInventory } from '../../hooks/useInventory'
import { useBranches } from '../../hooks/useBranches'
import { adjustStock } from '../../services/inventoryService'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import InventoryFilter from '../../components/filters/InventoryFilter'
import StockAdjustmentModal from '../../components/modals/StockAdjustmentModal'
import { exportToCSV } from '../../utils/exportToCSV'

const statusVariant = {
  critical: 'danger',
  low: 'warning',
  healthy: 'success',
}

const InventoryPage = () => {
  const [filters, setFilters] = useState({})
  const [selectedItem, setSelectedItem] = useState(null)
  const [showAdjustModal, setShowAdjustModal] = useState(false)
  
  const queryClient = useQueryClient()
  const { data: inventory = [], isLoading, isError, error, refetch } = useInventory(filters)
  const { data: branches = [] } = useBranches()

  const adjustStockMutation = useMutation({
    mutationFn: adjustStock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      setShowAdjustModal(false)
      setSelectedItem(null)
      toast.success('Stock adjusted successfully')
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to adjust stock')
    },
  })

  const handleAdjustClick = (item) => {
    setSelectedItem(item)
    setShowAdjustModal(true)
  }

  const handleCloseModal = () => {
    setShowAdjustModal(false)
    setSelectedItem(null)
  }

  const handleAdjustSubmit = async (adjustmentData) => {
    await adjustStockMutation.mutateAsync(adjustmentData)
  }

  const handleExportCSV = () => {
    const columns = [
      { key: 'ingredient_name', header: 'Ingredient' },
      { key: 'branch_name', header: 'Branch' },
      { key: 'quantity_available', header: 'Current Stock' },
      { key: 'unit', header: 'Unit' },
      { key: 'reorder_level', header: 'Reorder Level' },
      { key: 'stock_status', header: 'Status' },
    ]

    exportToCSV(inventory, `inventory-${new Date().toISOString().split('T')[0]}`, columns)
    toast.success('Inventory exported successfully')
  }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <LoadingSpinner label="Loading inventory" />
      </div>
    )
  }

  if (isError) {
    return (
      <Alert variant="danger" className="d-flex justify-content-between align-items-center">
        <div>
          <h6 className="fw-semibold mb-1">Unable to load inventory</h6>
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
          <h2 className="fw-semibold mb-1">Inventory</h2>
          <p className="text-muted mb-0">Monitor stock levels and trigger replenishment.</p>
        </div>
        <Button variant="outline-primary">Adjust stock</Button>
      </div>

      <InventoryFilter onFilterChange={setFilters} branches={branches} />

      <Card className="border-0 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 className="mb-0">Stock overview</h5>
              <small className="text-muted">{inventory.length} ingredients tracked</small>
            </div>
            <Button variant="outline-secondary" size="sm" onClick={handleExportCSV}>
              Download report
            </Button>
          </div>
          <Table responsive hover className="mb-0">
            <thead>
              <tr>
                <th>Ingredient</th>
                <th>Branch</th>
                <th>Current stock</th>
                <th>Reorder level</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {inventory.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center text-muted py-4">
                    No inventory data available
                  </td>
                </tr>
              )}
              {inventory.map((item) => (
                <tr key={`${item.branch_id}-${item.ingredient_id}`}>
                  <td>{item.ingredient_name}</td>
                  <td>{item.branch_name}</td>
                  <td>
                    {item.quantity_available} {item.unit}
                  </td>
                  <td>
                    {item.reorder_level} {item.unit}
                  </td>
                  <td className="d-flex align-items-center gap-2">
                    <Badge bg={statusVariant[item.stock_status] || 'secondary'} className="text-capitalize">
                      {item.stock_status}
                    </Badge>
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="p-0 text-decoration-none"
                      onClick={() => handleAdjustClick(item)}
                    >
                      Adjust
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <StockAdjustmentModal
        show={showAdjustModal}
        onHide={handleCloseModal}
        inventoryItem={selectedItem}
        onSubmit={handleAdjustSubmit}
      />
    </div>
  )
}

export default InventoryPage
