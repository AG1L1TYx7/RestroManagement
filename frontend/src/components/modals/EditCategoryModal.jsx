import { useState, useEffect } from 'react'
import { Modal, Form, Button, Alert } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import PropTypes from 'prop-types'
import { useUpdateCategory } from '../../hooks/useCategories'
import { toast } from 'react-toastify'

const schema = yup.object({
  categoryName: yup.string().required('Category name is required'),
  description: yup.string(),
})

const EditCategoryModal = ({ show, onHide, category }) => {
  const [submitError, setSubmitError] = useState(null)
  const updateCategoryMutation = useUpdateCategory()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  })

  useEffect(() => {
    if (category) {
      reset({
        categoryName: category.category_name || '',
        description: category.description || '',
      })
    }
  }, [category, reset])

  const handleClose = () => {
    reset()
    setSubmitError(null)
    onHide()
  }

  const onFormSubmit = async (data) => {
    setSubmitError(null)

    try {
      await updateCategoryMutation.mutateAsync({
        id: category.id,
        data: {
          category_name: data.categoryName,
          description: data.description || null,
        },
      })
      toast.success('Category updated successfully')
      handleClose()
    } catch (error) {
      setSubmitError(error.message || 'Failed to update category')
    }
  }

  if (!category) return null

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Category</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit(onFormSubmit)}>
        <Modal.Body>
          {submitError && (
            <Alert variant="danger" dismissible onClose={() => setSubmitError(null)}>
              {submitError}
            </Alert>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Category Name *</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g., Appetizers, Main Course"
              {...register('categoryName')}
              isInvalid={!!errors.categoryName}
            />
            <Form.Control.Feedback type="invalid">{errors.categoryName?.message}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Describe this category"
              {...register('description')}
              isInvalid={!!errors.description}
            />
            <Form.Control.Feedback type="invalid">{errors.description?.message}</Form.Control.Feedback>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={updateCategoryMutation.isPending}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={updateCategoryMutation.isPending}>
            {updateCategoryMutation.isPending ? 'Updating...' : 'Update Category'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

EditCategoryModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  category: PropTypes.object,
}

export default EditCategoryModal
