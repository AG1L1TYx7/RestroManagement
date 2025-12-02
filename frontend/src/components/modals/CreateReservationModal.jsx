import { useState } from 'react'
import { Modal, Form, Button, Alert } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import PropTypes from 'prop-types'
import { useCreateReservation } from '../../hooks/useReservations'
import { useAvailableTables } from '../../hooks/useTables'
import { toast } from 'react-toastify'

const schema = yup.object({
  customerName: yup.string().required('Customer name is required'),
  customerPhone: yup.string().required('Phone number is required'),
  customerEmail: yup.string().email('Invalid email').nullable(),
  reservationDate: yup.date().required('Reservation date is required').min(new Date(), 'Date must be in the future'),
  reservationTime: yup.string().required('Reservation time is required'),
  partySize: yup.number().positive().integer().required('Party size is required').typeError('Party size must be a number'),
  tableId: yup.number().positive().nullable(),
  specialRequests: yup.string(),
})

const CreateReservationModal = ({ show, onHide }) => {
  const [submitError, setSubmitError] = useState(null)
  const createReservationMutation = useCreateReservation()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      reservationDate: '',
      reservationTime: '',
      partySize: '',
      tableId: '',
      specialRequests: '',
    },
  })

  const partySize = watch('partySize')
  const { data: availableTables = [] } = useAvailableTables({ capacity: partySize })

  const handleClose = () => {
    reset()
    setSubmitError(null)
    onHide()
  }

  const onFormSubmit = async (data) => {
    setSubmitError(null)

    try {
      await createReservationMutation.mutateAsync({
        customer_name: data.customerName,
        customer_phone: data.customerPhone,
        customer_email: data.customerEmail || null,
        reservation_date: data.reservationDate,
        reservation_time: data.reservationTime,
        party_size: parseInt(data.partySize),
        table_id: data.tableId ? parseInt(data.tableId) : null,
        special_requests: data.specialRequests || null,
      })
      toast.success('Reservation created successfully')
      handleClose()
    } catch (error) {
      setSubmitError(error.message || 'Failed to create reservation')
    }
  }

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>New Reservation</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit(onFormSubmit)}>
        <Modal.Body>
          {submitError && (
            <Alert variant="danger" dismissible onClose={() => setSubmitError(null)}>
              {submitError}
            </Alert>
          )}

          <h6 className="mb-3">Customer Information</h6>
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <Form.Group>
                <Form.Label>Customer Name *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="John Doe"
                  {...register('customerName')}
                  isInvalid={!!errors.customerName}
                />
                <Form.Control.Feedback type="invalid">{errors.customerName?.message}</Form.Control.Feedback>
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group>
                <Form.Label>Phone Number *</Form.Label>
                <Form.Control
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  {...register('customerPhone')}
                  isInvalid={!!errors.customerPhone}
                />
                <Form.Control.Feedback type="invalid">{errors.customerPhone?.message}</Form.Control.Feedback>
              </Form.Group>
            </div>
            <div className="col-12">
              <Form.Group>
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="john@example.com"
                  {...register('customerEmail')}
                  isInvalid={!!errors.customerEmail}
                />
                <Form.Control.Feedback type="invalid">{errors.customerEmail?.message}</Form.Control.Feedback>
              </Form.Group>
            </div>
          </div>

          <h6 className="mb-3">Reservation Details</h6>
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <Form.Group>
                <Form.Label>Date *</Form.Label>
                <Form.Control
                  type="date"
                  {...register('reservationDate')}
                  isInvalid={!!errors.reservationDate}
                />
                <Form.Control.Feedback type="invalid">{errors.reservationDate?.message}</Form.Control.Feedback>
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group>
                <Form.Label>Time *</Form.Label>
                <Form.Control
                  type="time"
                  {...register('reservationTime')}
                  isInvalid={!!errors.reservationTime}
                />
                <Form.Control.Feedback type="invalid">{errors.reservationTime?.message}</Form.Control.Feedback>
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group>
                <Form.Label>Party Size *</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Number of guests"
                  min="1"
                  {...register('partySize')}
                  isInvalid={!!errors.partySize}
                />
                <Form.Control.Feedback type="invalid">{errors.partySize?.message}</Form.Control.Feedback>
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group>
                <Form.Label>Table (Optional)</Form.Label>
                <Form.Select {...register('tableId')} isInvalid={!!errors.tableId}>
                  <option value="">Auto-assign</option>
                  {availableTables.map((table) => (
                    <option key={table.id} value={table.id}>
                      Table {table.table_number} (Capacity: {table.capacity})
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errors.tableId?.message}</Form.Control.Feedback>
                {partySize && availableTables.length === 0 && (
                  <Form.Text className="text-warning">
                    No tables available for party size of {partySize}
                  </Form.Text>
                )}
              </Form.Group>
            </div>
          </div>

          <Form.Group>
            <Form.Label>Special Requests</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Dietary restrictions, seating preferences, occasion, etc."
              {...register('specialRequests')}
              isInvalid={!!errors.specialRequests}
            />
            <Form.Control.Feedback type="invalid">{errors.specialRequests?.message}</Form.Control.Feedback>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={createReservationMutation.isPending}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={createReservationMutation.isPending}>
            {createReservationMutation.isPending ? 'Creating...' : 'Create Reservation'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

CreateReservationModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
}

export default CreateReservationModal
