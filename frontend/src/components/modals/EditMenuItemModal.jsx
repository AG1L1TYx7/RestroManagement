import { useState, useEffect } from 'react'
import { Modal, Form, Button, Alert } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import PropTypes from 'prop-types'
import { useUpdateMenuItem } from '../../hooks/useMenuItems'
import { toast } from 'react-toastify'

const schema = yup.object({
  itemName: yup.string().required('Item name is required'),
  description: yup.string(),
  price: yup.number().positive().required('Price is required').typeError('Price must be a number'),
  categoryId: yup.number().positive().required('Category is required'),
  imageUrl: yup.string().url('Must be a valid URL').nullable(),
})

const EditMenuItemModal = ({ show, onHide, item, categories }) => {
  const [submitError, setSubmitError] = useState(null)
  const updateMenuItemMutation = useUpdateMenuItem()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  })

  useEffect(() => {
    if (item) {
      reset({
        itemName: item.item_name || '',
        description: item.description || '',
        price: item.price || '',
        categoryId: item.category_id || '',
        imageUrl: item.image_url || '',
      })
    }
  }, [item, reset])

  const handleClose = () => {
    reset()
    setSubmitError(null)
    onHide()
  }

  const onFormSubmit = async (data) => {
    setSubmitError(null)

    try {
      await updateMenuItemMutation.mutateAsync({
        id: item.id,
        data: {
          item_name: data.itemName,
          description: data.description || null,
          price: parseFloat(data.price),
          category_id: parseInt(data.categoryId),
          image_url: data.imageUrl || null,
        },
      })
      toast.success('Menu item updated successfully')
      handleClose()
    } catch (error) {
      setSubmitError(error.message || 'Failed to update menu item')
    }
  }

  if (!item) return null

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Menu Item</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit(onFormSubmit)}>
        <Modal.Body>
          {submitError && (
            <Alert variant="danger" dismissible onClose={() => setSubmitError(null)}>
              {submitError}
            </Alert>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Item Name *</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g., Margherita Pizza"
              {...register('itemName')}
              isInvalid={!!errors.itemName}
            />
            <Form.Control.Feedback type="invalid">{errors.itemName?.message}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Category *</Form.Label>
            <Form.Select {...register('categoryId')} isInvalid={!!errors.categoryId}>
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.category_name}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">{errors.categoryId?.message}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Price *</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('price')}
              isInvalid={!!errors.price}
            />
            <Form.Control.Feedback type="invalid">{errors.price?.message}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Describe this dish"
              {...register('description')}
              isInvalid={!!errors.description}
            />
            <Form.Control.Feedback type="invalid">{errors.description?.message}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Image URL</Form.Label>
            <Form.Control
              type="url"
              placeholder="https://example.com/image.jpg"
              {...register('imageUrl')}
              isInvalid={!!errors.imageUrl}
            />
            <Form.Control.Feedback type="invalid">{errors.imageUrl?.message}</Form.Control.Feedback>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={updateMenuItemMutation.isPending}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={updateMenuItemMutation.isPending}>
            {updateMenuItemMutation.isPending ? 'Updating...' : 'Update Item'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

EditMenuItemModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  item: PropTypes.object,
  categories: PropTypes.array.isRequired,
}

export default EditMenuItemModal
