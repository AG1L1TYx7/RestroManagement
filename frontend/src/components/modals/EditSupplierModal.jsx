import { useState, useEffect } from 'react'
import { Modal, Form, Button, Alert } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import PropTypes from 'prop-types'
import { useUpdateSupplier } from '../../hooks/useSuppliers'
import { toast } from 'react-toastify'

const schema = yup.object({
  supplierName: yup.string().required('Supplier name is required'),
  contactPerson: yup.string(),
  phone: yup.string(),
  email: yup.string().email('Invalid email'),
  address: yup.string(),
})

const EditSupplierModal = ({ show, onHide, supplier }) => {
  const [submitError, setSubmitError] = useState(null)
  const updateSupplierMutation = useUpdateSupplier()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  })

  useEffect(() => {
    if (supplier) {
      reset({
        supplierName: supplier.supplier_name || '',
        contactPerson: supplier.contact_person || '',
        phone: supplier.phone || '',
        email: supplier.email || '',
        address: supplier.address || '',
      })
    }
  }, [supplier, reset])

  const handleClose = () => {
    reset()
    setSubmitError(null)
    onHide()
  }

  const onFormSubmit = async (data) => {
    setSubmitError(null)

    try {
      await updateSupplierMutation.mutateAsync({
        id: supplier.id,
        data: {
          supplier_name: data.supplierName,
          contact_person: data.contactPerson || null,
          phone: data.phone || null,
          email: data.email || null,
          address: data.address || null,
        },
      })
      toast.success('Supplier updated successfully')
      handleClose()
    } catch (error) {
      setSubmitError(error.message || 'Failed to update supplier')
    }
  }

  if (!supplier) return null

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Supplier</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit(onFormSubmit)}>
        <Modal.Body>
          {submitError && (
            <Alert variant="danger" dismissible onClose={() => setSubmitError(null)}>
              {submitError}
            </Alert>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Supplier Name *</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g., Fresh Foods Inc."
              {...register('supplierName')}
              isInvalid={!!errors.supplierName}
            />
            <Form.Control.Feedback type="invalid">{errors.supplierName?.message}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Contact Person</Form.Label>
            <Form.Control
              type="text"
              placeholder="Name of contact person"
              {...register('contactPerson')}
              isInvalid={!!errors.contactPerson}
            />
            <Form.Control.Feedback type="invalid">{errors.contactPerson?.message}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Phone</Form.Label>
            <Form.Control
              type="tel"
              placeholder="+1 (555) 123-4567"
              {...register('phone')}
              isInvalid={!!errors.phone}
            />
            <Form.Control.Feedback type="invalid">{errors.phone?.message}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="supplier@example.com"
              {...register('email')}
              isInvalid={!!errors.email}
            />
            <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Address</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="Full address"
              {...register('address')}
              isInvalid={!!errors.address}
            />
            <Form.Control.Feedback type="invalid">{errors.address?.message}</Form.Control.Feedback>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={updateSupplierMutation.isPending}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={updateSupplierMutation.isPending}>
            {updateSupplierMutation.isPending ? 'Updating...' : 'Update Supplier'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

EditSupplierModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  supplier: PropTypes.object,
}

export default EditSupplierModal
