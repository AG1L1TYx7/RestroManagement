import { useState } from 'react'
import { Alert, Badge, Button, Card, Table } from 'react-bootstrap'
import { toast } from 'react-toastify'
import { useRecipes, useDeleteRecipe } from '../../hooks/useRecipes'
import { useMenuItems } from '../../hooks/useMenuItems'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import CreateRecipeModal from '../../components/modals/CreateRecipeModal'
import EditRecipeModal from '../../components/modals/EditRecipeModal'

const RecipesPage = () => {
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)

  const { data: recipes = [], isLoading, isError, error, refetch } = useRecipes()
  const { data: menuItems = [] } = useMenuItems()
  const deleteRecipeMutation = useDeleteRecipe()

  const handleEditClick = (recipe) => {
    setSelectedRecipe(recipe)
    setShowEditModal(true)
  }

  const handleDeleteClick = async (recipeId) => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      try {
        await deleteRecipeMutation.mutateAsync(recipeId)
        toast.success('Recipe deleted successfully')
      } catch (error) {
        toast.error(error?.message || 'Failed to delete recipe')
      }
    }
  }

  const groupRecipesByMenuItem = () => {
    const grouped = {}
    recipes.forEach((recipe) => {
      const itemId = recipe.item_id
      if (!grouped[itemId]) {
        grouped[itemId] = {
          item_name: recipe.item_name,
          recipes: [],
        }
      }
      grouped[itemId].recipes.push(recipe)
    })
    return Object.entries(grouped)
  }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <LoadingSpinner label="Loading recipes" />
      </div>
    )
  }

  if (isError) {
    return (
      <Alert variant="danger" className="d-flex justify-content-between align-items-center">
        <div>
          <h6 className="fw-semibold mb-1">Unable to load recipes</h6>
          <p className="mb-0 small">{error?.message || 'Please check your connection and try again.'}</p>
        </div>
        <Button variant="outline-danger" onClick={() => refetch()}>
          Retry
        </Button>
      </Alert>
    )
  }

  const groupedRecipes = groupRecipesByMenuItem()

  return (
    <div className="d-flex flex-column gap-4">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <h2 className="fw-semibold mb-1">Recipes</h2>
          <p className="text-muted mb-0">Manage ingredient requirements for menu items.</p>
        </div>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          Add Ingredient to Recipe
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <Card.Body>
          {recipes.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted mb-3">No recipes found</p>
              <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                Create First Recipe
              </Button>
            </div>
          ) : (
            <div className="d-flex flex-column gap-4">
              {groupedRecipes.map(([itemId, data]) => (
                <div key={itemId}>
                  <h5 className="mb-3">{data.item_name}</h5>
                  <div className="table-responsive">
                    <Table hover className="mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Ingredient</th>
                          <th>Quantity Required</th>
                          <th>Unit</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.recipes.map((recipe) => (
                          <tr key={recipe.id}>
                            <td className="fw-semibold">{recipe.ingredient_name}</td>
                            <td>{recipe.quantity_required}</td>
                            <td>{recipe.unit}</td>
                            <td>
                              <div className="d-flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline-primary"
                                  onClick={() => handleEditClick(recipe)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline-danger"
                                  onClick={() => handleDeleteClick(recipe.id)}
                                >
                                  Remove
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>

      <CreateRecipeModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        menuItems={menuItems}
      />

      <EditRecipeModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        recipe={selectedRecipe}
      />
    </div>
  )
}

export default RecipesPage
