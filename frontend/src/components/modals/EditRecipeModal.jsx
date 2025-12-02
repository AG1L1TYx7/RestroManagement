import { useState, useEffect } from 'react'
import { Modal, Form, Button, Alert } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import PropTypes from 'prop-types'
import { useUpdateRecipe } from '../../hooks/useRecipes'
import { toast } from 'react-toastify'

const schema = yup.object({
  quantityRequired: yup.number().positive().required('Quantity is required').typeError('Quantity must be a number'),
})

const EditRecipeModal = ({ show, onHide, recipe }) => {
  const [submitError, setSubmitError] = useState(null)
  const updateRecipeMutation = useUpdateRecipe()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  })

  useEffect(() => {
    if (recipe) {
      reset({
        quantityRequired: recipe.quantity_required || '',
      })
    }
  }, [recipe, reset])

  const handleClose = () => {
    reset()
    setSubmitError(null)
    onHide()
  }

  const onFormSubmit = async (data) => {
    setSubmitError(null)

    try {
      await updateRecipeMutation.mutateAsync({
        id: recipe.id,
        data: {
          quantity_required: parseFloat(data.quantityRequired),
        },
      })
      toast.success('Recipe updated successfully')
      handleClose()
    } catch (error) {
      setSubmitError(error.message || 'Failed to update recipe')
    }
  }

  if (!recipe) return null

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Recipe</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit(onFormSubmit)}>
        <Modal.Body>
          {submitError && (
            <Alert variant="danger" dismissible onClose={() => setSubmitError(null)}>
              {submitError}
            </Alert>
          )}

          <div className="mb-3">
            <h6>{recipe.item_name}</h6>
            <p className="text-muted mb-0">Ingredient: {recipe.ingredient_name}</p>
          </div>

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
            <Form.Text className="text-muted">Unit: {recipe.unit}</Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={updateRecipeMutation.isPending}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={updateRecipeMutation.isPending}>
            {updateRecipeMutation.isPending ? 'Updating...' : 'Update Recipe'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

EditRecipeModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  recipe: PropTypes.object,
}

export default EditRecipeModal
