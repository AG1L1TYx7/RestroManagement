import { useState } from 'react'
import { Modal, Form, Button, Row, Col, Table, Alert, InputGroup } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import PropTypes from 'prop-types'
import { useMenuItems } from '../../hooks/useMenuItems'
import { formatCurrency } from '../../utils/formatters'

const schema = yup.object({
  customerName: yup.string().required('Customer name is required').min(2, 'Name must be at least 2 characters'),
  customerEmail: yup.string().email('Invalid email address'),
  customerPhone: yup.string(),
  branchId: yup.string().required('Branch is required'),
  notes: yup.string(),
})

const CreateOrderModal = ({ show, onHide, branches, onSubmit }) => {
  const [orderItems, setOrderItems] = useState([])
  const [selectedMenuItem, setSelectedMenuItem] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [menuSearch, setMenuSearch] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const { data: menuItems = [] } = useMenuItems()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  })

  const filteredMenuItems = (Array.isArray(menuItems) ? menuItems : []).filter((item) => {
    const name = typeof item?.item_name === 'string' ? item.item_name : ''
    return name.toLowerCase().includes(menuSearch.toLowerCase())
  })

  const handleAddItem = () => {
    if (!selectedMenuItem) return

    const menuItem = menuItems.find((item) => item.menu_item_id === parseInt(selectedMenuItem))
    if (!menuItem) return

    const existingItem = orderItems.find((item) => item.menu_item_id === menuItem.menu_item_id)

    if (existingItem) {
      setOrderItems(
        orderItems.map((item) =>
          item.menu_item_id === menuItem.menu_item_id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      )
    } else {
      setOrderItems([
        ...orderItems,
        {
          menu_item_id: menuItem.menu_item_id,
          menu_item_name: menuItem.item_name,
          unit_price: menuItem.price,
          quantity: quantity,
        },
      ])
    }

    setSelectedMenuItem('')
    setQuantity(1)
    setMenuSearch('')
  }

  const handleRemoveItem = (menuItemId) => {
    setOrderItems(orderItems.filter((item) => item.menu_item_id !== menuItemId))
  }

  const handleUpdateQuantity = (menuItemId, newQuantity) => {
    if (newQuantity < 1) return
    setOrderItems(
      orderItems.map((item) =>
        item.menu_item_id === menuItemId ? { ...item, quantity: newQuantity } : item
      )
    )
  }

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
  }

  const handleClose = () => {
    reset()
    setOrderItems([])
    setSelectedMenuItem('')
    setQuantity(1)
    setMenuSearch('')
    setSubmitError(null)
    onHide()
  }

  const onFormSubmit = async (data) => {
    if (orderItems.length === 0) {
      setSubmitError('Please add at least one item to the order')
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      await onSubmit({
        ...data,
        branchId: parseInt(data.branchId),
        items: orderItems.map((item) => ({
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
        })),
      })
      handleClose()
    } catch (error) {
      setSubmitError(error.message || 'Failed to create order')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Create New Order</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit(onFormSubmit)}>
        <Modal.Body>
          {submitError && (
            <Alert variant="danger" dismissible onClose={() => setSubmitError(null)}>
              {submitError}
            </Alert>
          )}

          <h6 className="mb-3">Customer Information</h6>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Customer Name *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter customer name"
                  {...register('customerName')}
                  isInvalid={!!errors.customerName}
                />
                <Form.Control.Feedback type="invalid">{errors.customerName?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>
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
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="customer@email.com"
                  {...register('customerEmail')}
                  isInvalid={!!errors.customerEmail}
                />
                <Form.Control.Feedback type="invalid">{errors.customerEmail?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  type="tel"
                  placeholder="+1-555-0000"
                  {...register('customerPhone')}
                />
              </Form.Group>
            </Col>
          </Row>

          <hr className="my-4" />

          <h6 className="mb-3">Order Items</h6>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Search Menu Item</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Search menu..."
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Menu Item</Form.Label>
                <Form.Select
                  value={selectedMenuItem}
                  onChange={(e) => setSelectedMenuItem(e.target.value)}
                >
                  <option value="">Select item</option>
                  {filteredMenuItems.map((item) => (
                    <option key={item.menu_item_id} value={item.menu_item_id}>
                      {item.item_name} - {formatCurrency(item.price)}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Qty</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  />
                  <Button variant="primary" onClick={handleAddItem} disabled={!selectedMenuItem}>
                    Add
                  </Button>
                </InputGroup>
              </Form.Group>
            </Col>
          </Row>

          {orderItems.length > 0 ? (
            <Table bordered size="sm" className="mb-3">
              <thead className="table-light">
                <tr>
                  <th>Item</th>
                  <th className="text-center" style={{ width: '120px' }}>Quantity</th>
                  <th className="text-end" style={{ width: '100px' }}>Price</th>
                  <th className="text-end" style={{ width: '100px' }}>Total</th>
                  <th style={{ width: '60px' }}></th>
                </tr>
              </thead>
              <tbody>
                {orderItems.map((item) => (
                  <tr key={item.menu_item_id}>
                    <td>{item.menu_item_name}</td>
                    <td className="text-center">
                      <InputGroup size="sm">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => handleUpdateQuantity(item.menu_item_id, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <Form.Control
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleUpdateQuantity(item.menu_item_id, parseInt(e.target.value) || 1)
                          }
                          style={{ textAlign: 'center', maxWidth: '60px' }}
                        />
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => handleUpdateQuantity(item.menu_item_id, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </InputGroup>
                    </td>
                    <td className="text-end">{formatCurrency(item.unit_price)}</td>
                    <td className="text-end">{formatCurrency(item.unit_price * item.quantity)}</td>
                    <td className="text-center">
                      <Button
                        variant="link"
                        size="sm"
                        className="text-danger p-0"
                        onClick={() => handleRemoveItem(item.menu_item_id)}
                      >
                        ✕
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="table-light">
                <tr>
                  <td colSpan="3" className="text-end">
                    <strong>Total:</strong>
                  </td>
                  <td className="text-end">
                    <strong>{formatCurrency(calculateTotal())}</strong>
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </Table>
          ) : (
            <Alert variant="info" className="mb-3">
              No items added yet. Select a menu item above to add to the order.
            </Alert>
          )}

          <Form.Group>
            <Form.Label>Notes</Form.Label>
            <Form.Control as="textarea" rows={2} placeholder="Special instructions..." {...register('notes')} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={isSubmitting || orderItems.length === 0}>
            {isSubmitting ? 'Creating Order...' : `Create Order (${formatCurrency(calculateTotal())})`}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

CreateOrderModal.propTypes = {
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

export default CreateOrderModal
