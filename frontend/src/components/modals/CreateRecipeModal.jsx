import { useState } from 'react'
import { Modal, Form, Button, Alert } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import PropTypes from 'prop-types'
import { useCreateRecipe } from '../../hooks/useRecipes'
import { toast } from 'react-toastify'

const schema = yup.object({
  itemId: yup.number().positive().required('Menu item is required'),
  ingredientId: yup.number().positive().required('Ingredient is required'),
  quantityRequired: yup.number().positive().required('Quantity is required').typeError('Quantity must be a number'),
})

const CreateRecipeModal = ({ show, onHide, menuItems }) => {
  const [submitError, setSubmitError] = useState(null)
  const createRecipeMutation = useCreateRecipe()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  })

  const handleClose = () => {
    reset()
    setSubmitError(null)
    onHide()
  }

  const onFormSubmit = async (data) => {
    setSubmitError(null)

    try {
      await createRecipeMutation.mutateAsync({
        item_id: parseInt(data.itemId),
        ingredient_id: parseInt(data.ingredientId),
        quantity_required: parseFloat(data.quantityRequired),
      })
      toast.success('Recipe created successfully')
      handleClose()
    } catch (error) {
      setSubmitError(error.message || 'Failed to create recipe')
    }
  }

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add Ingredient to Recipe</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit(onFormSubmit)}>
        <Modal.Body>
          {submitError && (
            <Alert variant="danger" dismissible onClose={() => setSubmitError(null)}>
              {submitError}
            </Alert>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Menu Item *</Form.Label>
            <Form.Select {...register('itemId')} isInvalid={!!errors.itemId}>
              <option value="">Select menu item</option>
              {menuItems.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.item_name}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">{errors.itemId?.message}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Ingredient ID *</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter ingredient ID"
              {...register('ingredientId')}
              isInvalid={!!errors.ingredientId}
            />
            <Form.Control.Feedback type="invalid">{errors.ingredientId?.message}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Quantity Required *</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              placeholder="e.g., 2.5"
              {...register('quantityRequired')}
              isInvalid={!!errors.quantityRequired}
            />
            <Form.Control.Feedback type="invalid">{errors.quantityRequired?.message}</Form.Control.Feedback>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={createRecipeMutation.isPending}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={createRecipeMutation.isPending}>
            {createRecipeMutation.isPending ? 'Adding...' : 'Add to Recipe'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

CreateRecipeModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  menuItems: PropTypes.array.isRequired,
}

export default CreateRecipeModal
