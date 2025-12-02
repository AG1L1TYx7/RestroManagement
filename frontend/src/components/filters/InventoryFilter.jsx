import { useState, useEffect, useCallback } from 'react'
import { Form, Button, Row, Col, Badge } from 'react-bootstrap'
import PropTypes from 'prop-types'

const InventoryFilter = ({ onFilterChange, branches }) => {
  const [filters, setFilters] = useState({
    stockStatus: [],
    branchId: '',
    ingredientSearch: '',
  })
  const [searchInput, setSearchInput] = useState('')

  const stockStatusOptions = [
    { value: 'critical', label: 'Critical', variant: 'danger' },
    { value: 'low', label: 'Low', variant: 'warning' },
    { value: 'healthy', label: 'Healthy', variant: 'success' },
  ]

  const handleFilterUpdate = useCallback((key, value) => {
    const updated = { ...filters, [key]: value }
    setFilters(updated)
    onFilterChange(updated)
  }, [filters, onFilterChange])

  // Debounce ingredient search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleFilterUpdate('ingredientSearch', searchInput)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchInput, handleFilterUpdate])

  const handleStockStatusToggle = (statusValue) => {
    const newStatus = filters.stockStatus.includes(statusValue)
      ? filters.stockStatus.filter((s) => s !== statusValue)
      : [...filters.stockStatus, statusValue]
    handleFilterUpdate('stockStatus', newStatus)
  }

  const handleClearFilters = () => {
    const clearedFilters = {
      stockStatus: [],
      branchId: '',
      ingredientSearch: '',
    }
    setFilters(clearedFilters)
    setSearchInput('')
    onFilterChange(clearedFilters)
  }

  const hasActiveFilters =
    filters.stockStatus.length > 0 ||
    filters.branchId ||
    filters.ingredientSearch

  return (
    <div className="mb-4 p-3 bg-white rounded border">
      <Row className="g-3 align-items-end">
        <Col md={4}>
          <Form.Group>
            <Form.Label className="small fw-semibold">Search Ingredient</Form.Label>
            <Form.Control
              type="text"
              placeholder="Search by ingredient name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              size="sm"
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <Form.Label className="small fw-semibold">Branch</Form.Label>
            <Form.Select
              value={filters.branchId}
              onChange={(e) => handleFilterUpdate('branchId', e.target.value)}
              size="sm"
            >
              <option value="">All Branches</option>
              {branches.map((branch) => (
                <option key={branch.branch_id} value={branch.branch_id}>
                  {branch.branch_name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Row className="mt-3">
        <Col>
          <Form.Label className="small fw-semibold d-block mb-2">Stock Status</Form.Label>
          <div className="d-flex flex-wrap gap-2">
            {stockStatusOptions.map((option) => {
              const isSelected = filters.stockStatus.includes(option.value)
              return (
                <Badge
                  key={option.value}
                  bg={isSelected ? option.variant : 'light'}
                  text={isSelected ? 'white' : 'dark'}
                  className="px-3 py-2 cursor-pointer border"
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => handleStockStatusToggle(option.value)}
                >
                  {option.label}
                </Badge>
              )
            })}
          </div>
        </Col>
        {hasActiveFilters && (
          <Col xs="auto" className="d-flex align-items-end">
            <Button variant="outline-secondary" size="sm" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </Col>
        )}
      </Row>
    </div>
  )
}

InventoryFilter.propTypes = {
  onFilterChange: PropTypes.func.isRequired,
  branches: PropTypes.arrayOf(
    PropTypes.shape({
      branch_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      branch_name: PropTypes.string.isRequired,
    })
  ).isRequired,
}

export default InventoryFilter
