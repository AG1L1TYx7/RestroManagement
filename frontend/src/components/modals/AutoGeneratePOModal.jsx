import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Modal, Button, Table, Alert, Badge, Form } from 'react-bootstrap'
import { formatCurrency } from '../../utils/formatters'

const AutoGeneratePOModal = ({ show, onHide, onGenerate, isGenerating }) => {
  const [previewData, setPreviewData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [quantities, setQuantities] = useState({})

  useEffect(() => {
    if (show) {
      fetchPreview()
    } else {
      // Reset state when modal closes
      setPreviewData(null)
      setQuantities({})
      setError(null)
    }
  }, [show])

  const fetchPreview = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Fetch preview data from backend
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1'}/purchase-orders/auto-generate/preview`
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch preview data')
      }

      const result = await response.json()
      setPreviewData(result.data)

      // Initialize quantities with suggested amounts
      const initialQuantities = {}
      result.data?.suppliers?.forEach((supplier) => {
        supplier.ingredients.forEach((ingredient) => {
          const key = `${supplier.supplier_id}-${ingredient.ingredient_id}`
          initialQuantities[key] = ingredient.suggested_quantity
        })
      })
      setQuantities(initialQuantities)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuantityChange = (supplierId, ingredientId, value) => {
    const key = `${supplierId}-${ingredientId}`
    setQuantities((prev) => ({
      ...prev,
      [key]: parseFloat(value) || 0,
    }))
  }

  const handleGenerate = () => {
    // Transform quantities back to the format expected by backend
    const posToCreate = previewData.suppliers.map((supplier) => ({
      supplier_id: supplier.supplier_id,
      branch_id: previewData.branch_id,
      ingredients: supplier.ingredients
        .map((ingredient) => {
          const key = `${supplier.supplier_id}-${ingredient.ingredient_id}`
          const quantity = quantities[key]
          if (quantity > 0) {
            return {
              ingredient_id: ingredient.ingredient_id,
              quantity: quantity,
            }
          }
          return null
        })
        .filter(Boolean),
    })).filter((po) => po.ingredients.length > 0)

    onGenerate(posToCreate)
  }

  const getTotalPOs = () => {
    if (!previewData) return 0
    return previewData.suppliers.filter((supplier) =>
      supplier.ingredients.some((ingredient) => {
        const key = `${supplier.supplier_id}-${ingredient.ingredient_id}`
        return quantities[key] > 0
      })
    ).length
  }

  const getTotalItems = () => {
    return Object.values(quantities).filter((qty) => qty > 0).length
  }

  return (
    <Modal show={show} onHide={onHide} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>Auto-Generate Purchase Orders</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {isLoading && (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-muted">Analyzing inventory levels...</p>
          </div>
        )}

        {error && (
          <Alert variant="danger">
            <strong>Error:</strong> {error}
          </Alert>
        )}

        {!isLoading && !error && previewData && (
          <>
            <Alert variant="info">
              <strong>Low Stock Items Found:</strong> The following ingredients are below their reorder levels.
              Review and adjust quantities before generating purchase orders.
            </Alert>

            {previewData.suppliers.length === 0 ? (
              <Alert variant="success">
                <strong>All Good!</strong> No ingredients are currently below reorder level.
              </Alert>
            ) : (
              <>
                {previewData.suppliers.map((supplier) => (
                  <div key={supplier.supplier_id} className="mb-4">
                    <h6 className="d-flex align-items-center gap-2 mb-3">
                      {supplier.supplier_name}
                      <Badge bg="secondary" className="ms-2">
                        {supplier.ingredients.length} items
                      </Badge>
                    </h6>
                    <Table responsive bordered hover size="sm">
                      <thead className="table-light">
                        <tr>
                          <th>Ingredient</th>
                          <th>Branch</th>
                          <th className="text-end">Current</th>
                          <th className="text-end">Reorder Level</th>
                          <th className="text-end">Unit Price</th>
                          <th style={{ width: '150px' }}>Order Qty</th>
                          <th className="text-end">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {supplier.ingredients.map((ingredient) => {
                          const key = `${supplier.supplier_id}-${ingredient.ingredient_id}`
                          const quantity = quantities[key] || 0
                          const subtotal = quantity * ingredient.unit_price
                          
                          return (
                            <tr key={ingredient.ingredient_id}>
                              <td>{ingredient.ingredient_name}</td>
                              <td>{ingredient.branch_name}</td>
                              <td className="text-end">
                                {ingredient.current_stock} {ingredient.unit}
                              </td>
                              <td className="text-end">
                                {ingredient.reorder_level} {ingredient.unit}
                              </td>
                              <td className="text-end">{formatCurrency(ingredient.unit_price)}</td>
                              <td>
                                <Form.Control
                                  type="number"
                                  size="sm"
                                  step="0.01"
                                  min="0"
                                  value={quantity}
                                  onChange={(e) =>
                                    handleQuantityChange(
                                      supplier.supplier_id,
                                      ingredient.ingredient_id,
                                      e.target.value
                                    )
                                  }
                                />
                              </td>
                              <td className="text-end">{formatCurrency(subtotal)}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </Table>
                  </div>
                ))}

                <Alert variant="secondary" className="mb-0">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>Summary:</strong> {getTotalPOs()} purchase order(s) will be created with {getTotalItems()} total item(s)
                    </div>
                  </div>
                </Alert>
              </>
            )}
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={isGenerating}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleGenerate}
          disabled={isGenerating || isLoading || getTotalPOs() === 0}
        >
          {isGenerating ? 'Generating...' : `Generate ${getTotalPOs()} PO(s)`}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

AutoGeneratePOModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  onGenerate: PropTypes.func.isRequired,
  isGenerating: PropTypes.bool,
}

export default AutoGeneratePOModal
