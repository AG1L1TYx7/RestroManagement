import { useState, useEffect } from 'react'
import { Modal, Form, Button, Row, Col, Table, Alert, InputGroup } from 'react-bootstrap'
import { useForm, useFieldArray } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import PropTypes from 'prop-types'
import { useSuppliers } from '../../hooks/useSuppliers'
import { formatCurrency } from '../../utils/formatters'

const schema = yup.object({
  branchId: yup.string().required('Branch is required'),
  supplierId: yup.string().required('Supplier is required'),
  expectedDeliveryDate: yup.date().required('Expected delivery date is required'),
  notes: yup.string(),
  items: yup
    .array()
    .of(
      yup.object({
        ingredientName: yup.string().required('Ingredient name is required'),
        quantity: yup
          .number()
          .typeError('Quantity must be a number')
          .positive('Quantity must be positive')
          .required('Quantity is required'),
        unit: yup.string().required('Unit is required'),
        unitPrice: yup
          .number()
          .typeError('Unit price must be a number')
          .positive('Unit price must be positive')
          .required('Unit price is required'),
      })
    )
    .min(1, 'At least one item is required'),
})

const CreatePurchaseOrderModal = ({ show, onHide, branches, onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const { data: suppliers = [] } = useSuppliers()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      branchId: '',
      supplierId: '',
      expectedDeliveryDate: '',
      notes: '',
      items: [{ ingredientName: '', quantity: '', unit: 'kg', unitPrice: '' }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  })

  const items = watch('items')

  const calculateTotal = () => {
    if (!items) return 0
    return items.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0
      const price = parseFloat(item.unitPrice) || 0
      return sum + qty * price
    }, 0)
  }

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
        ...data,
        branchId: parseInt(data.branchId),
        supplierId: parseInt(data.supplierId),
        items: data.items.map((item) => ({
          ingredientName: item.ingredientName,
          quantity: parseFloat(item.quantity),
          unit: item.unit,
          unitPrice: parseFloat(item.unitPrice),
        })),
      })
      handleClose()
    } catch (error) {
      setSubmitError(error.message || 'Failed to create purchase order')
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (!show) {
      reset()
    }
  }, [show, reset])

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Create Purchase Order</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit(onFormSubmit)}>
        <Modal.Body>
          {submitError && (
            <Alert variant="danger" dismissible onClose={() => setSubmitError(null)}>
              {submitError}
            </Alert>
          )}

          <h6 className="mb-3">Purchase Order Information</h6>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Branch *</Form.Label>
                <Form.Select {...register('branchId')} isInvalid={!!errors.branchId}>
                  <option value="">Select branch</option>
                  {branches.map((branch) => (
                    <option key={branch.branch_id} value={branch.branch_id}>
                      {branch.branch_name}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errors.branchId?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Supplier *</Form.Label>
                <Form.Select {...register('supplierId')} isInvalid={!!errors.supplierId}>
                  <option value="">Select supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.supplier_id} value={supplier.supplier_id}>
                      {supplier.supplier_name}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errors.supplierId?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Expected Delivery Date *</Form.Label>
                <Form.Control
                  type="date"
                  {...register('expectedDeliveryDate')}
                  isInvalid={!!errors.expectedDeliveryDate}
                  min={new Date().toISOString().split('T')[0]}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.expectedDeliveryDate?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <hr className="my-4" />

          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="mb-0">Line Items</h6>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => append({ ingredientName: '', quantity: '', unit: 'kg', unitPrice: '' })}
            >
              + Add Item
            </Button>
          </div>

          {errors.items && typeof errors.items.message === 'string' && (
            <Alert variant="warning" className="mb-3">
              {errors.items.message}
            </Alert>
          )}

          <Table bordered size="sm" className="mb-3">
            <thead className="table-light">
              <tr>
                <th style={{ width: '30%' }}>Ingredient *</th>
                <th style={{ width: '15%' }}>Quantity *</th>
                <th style={{ width: '15%' }}>Unit *</th>
                <th style={{ width: '20%' }}>Unit Price *</th>
                <th className="text-end" style={{ width: '15%' }}>Subtotal</th>
                <th style={{ width: '5%' }}></th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => {
                const quantity = parseFloat(items?.[index]?.quantity) || 0
                const unitPrice = parseFloat(items?.[index]?.unitPrice) || 0
                const subtotal = quantity * unitPrice

                return (
                  <tr key={field.id}>
                    <td>
                      <Form.Control
                        size="sm"
                        type="text"
                        placeholder="e.g. Tomatoes"
                        {...register(`items.${index}.ingredientName`)}
                        isInvalid={!!errors.items?.[index]?.ingredientName}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.items?.[index]?.ingredientName?.message}
                      </Form.Control.Feedback>
                    </td>
                    <td>
                      <Form.Control
                        size="sm"
                        type="number"
                        step="0.01"
                        placeholder="0"
                        {...register(`items.${index}.quantity`)}
                        isInvalid={!!errors.items?.[index]?.quantity}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.items?.[index]?.quantity?.message}
                      </Form.Control.Feedback>
                    </td>
                    <td>
                      <Form.Select
                        size="sm"
                        {...register(`items.${index}.unit`)}
                        isInvalid={!!errors.items?.[index]?.unit}
                      >
                        <option value="kg">kg</option>
                        <option value="L">L</option>
                        <option value="pcs">pcs</option>
                        <option value="box">box</option>
                        <option value="bag">bag</option>
                      </Form.Select>
                      <Form.Control.Feedback type="invalid">
                        {errors.items?.[index]?.unit?.message}
                      </Form.Control.Feedback>
                    </td>
                    <td>
                      <InputGroup size="sm">
                        <InputGroup.Text>$</InputGroup.Text>
                        <Form.Control
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...register(`items.${index}.unitPrice`)}
                          isInvalid={!!errors.items?.[index]?.unitPrice}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.items?.[index]?.unitPrice?.message}
                        </Form.Control.Feedback>
                      </InputGroup>
                    </td>
                    <td className="text-end align-middle">{formatCurrency(subtotal)}</td>
                    <td className="text-center">
                      <Button
                        variant="link"
                        size="sm"
                        className="text-danger p-0"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                      >
                        ✕
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot className="table-light">
              <tr>
                <td colSpan="4" className="text-end">
                  <strong>Total:</strong>
                </td>
                <td className="text-end">
                  <strong>{formatCurrency(calculateTotal())}</strong>
                </td>
                <td></td>
              </tr>
            </tfoot>
          </Table>

          <Form.Group>
            <Form.Label>Notes</Form.Label>
            <Form.Control as="textarea" rows={2} placeholder="Special instructions..." {...register('notes')} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating PO...' : `Create PO (${formatCurrency(calculateTotal())})`}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

CreatePurchaseOrderModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  branches: PropTypes.arrayOf(
    PropTypes.shape({
      branch_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      branch_name: PropTypes.string.isRequired,
    })
  ).isRequired,
  onSubmit: PropTypes.func.isRequired,
}

export default CreatePurchaseOrderModal
