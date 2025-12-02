import { useState } from 'react'
import { Modal, Form, Button, Alert } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import PropTypes from 'prop-types'

const schema = yup.object({
  adjustmentType: yup.string().oneOf(['add', 'remove', 'set']).required('Adjustment type is required'),
  quantity: yup
    .number()
    .positive('Quantity must be positive')
    .required('Quantity is required')
    .typeError('Quantity must be a number'),
  reason: yup.string().required('Reason is required').min(5, 'Reason must be at least 5 characters'),
})

const StockAdjustmentModal = ({ show, onHide, inventoryItem, onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      adjustmentType: 'add',
      quantity: '',
      reason: '',
    },
  })

  const adjustmentType = watch('adjustmentType')
  const quantity = watch('quantity')

  const handleClose = () => {
    reset()
    setSubmitError(null)
    onHide()
  }

  const onFormSubmit = async (data) => {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      await onSubmit({
        branchId: inventoryItem.branch_id,
        ingredientId: inventoryItem.ingredient_id,
        adjustmentType: data.adjustmentType,
        quantity: parseFloat(data.quantity),
        reason: data.reason,
      })
      handleClose()
    } catch (error) {
      setSubmitError(error.message || 'Failed to adjust stock')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!inventoryItem) return null

  const calculateNewStock = () => {
    const current = inventoryItem.quantity_available
    const adj = parseFloat(quantity) || 0

    switch (adjustmentType) {
      case 'add':
        return current + adj
      case 'remove':
        return Math.max(0, current - adj)
      case 'set':
        return adj
      default:
        return current
    }
  }

  const newStock = calculateNewStock()

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Adjust Stock</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit(onFormSubmit)}>
        <Modal.Body>
          {submitError && (
            <Alert variant="danger" dismissible onClose={() => setSubmitError(null)}>
              {submitError}
            </Alert>
          )}

          <div className="mb-3">
            <h6>{inventoryItem.ingredient_name}</h6>
            <p className="text-muted mb-0">
              {inventoryItem.branch_name} • Current: {inventoryItem.quantity_available} {inventoryItem.unit}
            </p>
          </div>

          <Form.Group className="mb-3">
            <Form.Label>Adjustment Type</Form.Label>
            <Form.Select {...register('adjustmentType')} isInvalid={!!errors.adjustmentType}>
              <option value="add">Add to Stock</option>
              <option value="remove">Remove from Stock</option>
              <option value="set">Set Stock Level</option>
            </Form.Select>
            <Form.Control.Feedback type="invalid">{errors.adjustmentType?.message}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Quantity ({inventoryItem.unit})</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              placeholder="Enter quantity"
              {...register('quantity')}
              isInvalid={!!errors.quantity}
            />
            <Form.Control.Feedback type="invalid">{errors.quantity?.message}</Form.Control.Feedback>
            {quantity && !errors.quantity && (
              <Form.Text className="text-info">
                New stock level will be: <strong>{newStock.toFixed(2)} {inventoryItem.unit}</strong>
              </Form.Text>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Reason</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="e.g., Received delivery, Waste, Inventory count correction"
              {...register('reason')}
              isInvalid={!!errors.reason}
            />
            <Form.Control.Feedback type="invalid">{errors.reason?.message}</Form.Control.Feedback>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Adjusting...' : 'Adjust Stock'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

StockAdjustmentModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  inventoryItem: PropTypes.shape({
    branch_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    branch_name: PropTypes.string.isRequired,
    ingredient_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    ingredient_name: PropTypes.string.isRequired,
    quantity_available: PropTypes.number.isRequired,
    unit: PropTypes.string.isRequired,
  }),
  onSubmit: PropTypes.func.isRequired,
}

export default StockAdjustmentModal
