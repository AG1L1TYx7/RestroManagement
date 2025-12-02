import { useState } from 'react'
import { Modal, Form, Button, Alert } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import PropTypes from 'prop-types'
import { useCreateTable } from '../../hooks/useTables'
import { toast } from 'react-toastify'

const schema = yup.object({
  tableNumber: yup.string().required('Table number is required'),
  capacity: yup
    .number()
    .positive('Capacity must be positive')
    .integer('Capacity must be a whole number')
    .required('Capacity is required')
    .typeError('Capacity must be a number'),
  location: yup.string(),
  notes: yup.string(),
})

const CreateTableModal = ({ show, onHide }) => {
  const [submitError, setSubmitError] = useState(null)
  const createTableMutation = useCreateTable()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      tableNumber: '',
      capacity: '',
      location: '',
      notes: '',
    },
  })

  const handleClose = () => {
    reset()
    setSubmitError(null)
    onHide()
  }

  const onFormSubmit = async (data) => {
    setSubmitError(null)

    try {
      await createTableMutation.mutateAsync({
        table_number: data.tableNumber,
        capacity: parseInt(data.capacity),
        location: data.location || null,
        notes: data.notes || null,
      })
      toast.success('Table created successfully')
      handleClose()
    } catch (error) {
      setSubmitError(error.message || 'Failed to create table')
    }
  }

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add New Table</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit(onFormSubmit)}>
        <Modal.Body>
          {submitError && (
            <Alert variant="danger" dismissible onClose={() => setSubmitError(null)}>
              {submitError}
            </Alert>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Table Number *</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g., T1, A5, Window-3"
              {...register('tableNumber')}
              isInvalid={!!errors.tableNumber}
            />
            <Form.Control.Feedback type="invalid">{errors.tableNumber?.message}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Capacity *</Form.Label>
            <Form.Control
              type="number"
              placeholder="Number of seats"
              min="1"
              {...register('capacity')}
              isInvalid={!!errors.capacity}
            />
            <Form.Control.Feedback type="invalid">{errors.capacity?.message}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Location</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g., Main Hall, Patio, VIP Section"
              {...register('location')}
              isInvalid={!!errors.location}
            />
            <Form.Control.Feedback type="invalid">{errors.location?.message}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Any special notes about this table"
              {...register('notes')}
              isInvalid={!!errors.notes}
            />
            <Form.Control.Feedback type="invalid">{errors.notes?.message}</Form.Control.Feedback>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={createTableMutation.isPending}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={createTableMutation.isPending}>
            {createTableMutation.isPending ? 'Creating...' : 'Create Table'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

CreateTableModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
}

export default CreateTableModal
