import { useEffect } from 'react'
import PropTypes from 'prop-types'
import { Modal, Button, Table, Form } from 'react-bootstrap'
import { useForm, useFieldArray } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { formatCurrency } from '../../utils/formatters'

const schema = yup.object().shape({
  lineItems: yup.array().of(
    yup.object().shape({
      quantity_received: yup
        .number()
        .typeError('Quantity must be a number')
        .min(0, 'Quantity cannot be negative')
        .required('Quantity is required'),
    })
  ),
})

const ReceiveDeliveryModal = ({ show, onHide, purchaseOrder, onSubmit }) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      lineItems: [],
    },
  })

  const { fields } = useFieldArray({
    control,
    name: 'lineItems',
  })

  useEffect(() => {
    if (purchaseOrder?.line_items) {
      reset({
        lineItems: purchaseOrder.line_items.map((item) => ({
          po_line_id: item.po_line_id,
          ingredient_name: item.ingredient_name,
          unit: item.unit,
          quantity_ordered: item.quantity,
          unit_price: item.unit_price,
          quantity_received: item.quantity, // Default to ordered quantity
        })),
      })
    }
  }, [purchaseOrder, reset])

  const onSubmitForm = async (data) => {
    const receivingData = {
      po_id: purchaseOrder.po_id,
      line_items: data.lineItems.map((item) => ({
        po_line_id: item.po_line_id,
        quantity_received: parseFloat(item.quantity_received),
      })),
    }
    await onSubmit(receivingData)
  }

  if (!purchaseOrder) return null

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Receive Delivery - PO-{purchaseOrder.po_id}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit(onSubmitForm)}>
        <Modal.Body>
          <div className="mb-3">
            <p className="text-muted mb-2">
              <strong>Supplier:</strong> {purchaseOrder.supplier_name}
            </p>
            <p className="text-muted mb-0">
              <strong>Expected:</strong> {new Date(purchaseOrder.expected_delivery_date).toLocaleDateString()}
            </p>
          </div>

          <Table responsive className="mb-0">
            <thead>
              <tr>
                <th>Ingredient</th>
                <th className="text-end">Ordered</th>
                <th className="text-end">Unit Price</th>
                <th style={{ width: '150px' }}>Received</th>
              </tr>
            </thead>
            <tbody>
              {fields.map((field, index) => (
                <tr key={field.id}>
                  <td>{field.ingredient_name}</td>
                  <td className="text-end">
                    {field.quantity_ordered} {field.unit}
                  </td>
                  <td className="text-end">{formatCurrency(field.unit_price)}</td>
                  <td>
                    <Form.Control
                      type="number"
                      step="0.01"
                      {...control.register(`lineItems.${index}.quantity_received`)}
                      isInvalid={!!errors.lineItems?.[index]?.quantity_received}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.lineItems?.[index]?.quantity_received?.message}
                    </Form.Control.Feedback>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <div className="alert alert-info mt-3 mb-0">
            <small>
              <strong>Note:</strong> Received quantities will be added to inventory. You can adjust quantities if the
              delivery differs from what was ordered.
            </small>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Receiving...' : 'Confirm Receipt'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

ReceiveDeliveryModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  purchaseOrder: PropTypes.shape({
    po_id: PropTypes.number.isRequired,
    supplier_name: PropTypes.string.isRequired,
    expected_delivery_date: PropTypes.string.isRequired,
    line_items: PropTypes.arrayOf(
      PropTypes.shape({
        po_line_id: PropTypes.number.isRequired,
        ingredient_name: PropTypes.string.isRequired,
        unit: PropTypes.string.isRequired,
        quantity: PropTypes.number.isRequired,
        unit_price: PropTypes.number.isRequired,
      })
    ),
  }),
  onSubmit: PropTypes.func.isRequired,
}

export default ReceiveDeliveryModal
