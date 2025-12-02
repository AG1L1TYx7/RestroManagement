import { useState } from 'react'
import { Form, Button, Row, Col, Badge } from 'react-bootstrap'
import PropTypes from 'prop-types'

const PurchaseOrdersFilter = ({ onFilterChange, branches, suppliers }) => {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: [],
    branchId: '',
    supplierId: '',
  })

  const statusOptions = [
    { value: 'draft', label: 'Draft', variant: 'secondary' },
    { value: 'pending', label: 'Pending', variant: 'warning' },
    { value: 'approved', label: 'Approved', variant: 'info' },
    { value: 'received', label: 'Received', variant: 'success' },
    { value: 'cancelled', label: 'Cancelled', variant: 'danger' },
  ]

  const handleFilterUpdate = (key, value) => {
    const updated = { ...filters, [key]: value }
    setFilters(updated)
    onFilterChange(updated)
  }

  const handleStatusToggle = (statusValue) => {
    const newStatus = filters.status.includes(statusValue)
      ? filters.status.filter((s) => s !== statusValue)
      : [...filters.status, statusValue]
    handleFilterUpdate('status', newStatus)
  }

  const handleClearFilters = () => {
    const clearedFilters = {
      startDate: '',
      endDate: '',
      status: [],
      branchId: '',
      supplierId: '',
    }
    setFilters(clearedFilters)
    onFilterChange(clearedFilters)
  }

  const hasActiveFilters =
    filters.startDate ||
    filters.endDate ||
    filters.status.length > 0 ||
    filters.branchId ||
    filters.supplierId

  return (
    <div className="mb-4 p-3 bg-white rounded border">
      <Row className="g-3 align-items-end">
        <Col md={3}>
          <Form.Group>
            <Form.Label className="small fw-semibold">Expected Delivery Start</Form.Label>
            <Form.Control
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterUpdate('startDate', e.target.value)}
              size="sm"
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label className="small fw-semibold">Expected Delivery End</Form.Label>
            <Form.Control
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterUpdate('endDate', e.target.value)}
              size="sm"
            />
          </Form.Group>
        </Col>
        <Col md={3}>
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
        <Col md={3}>
          <Form.Group>
            <Form.Label className="small fw-semibold">Supplier</Form.Label>
            <Form.Select
              value={filters.supplierId}
              onChange={(e) => handleFilterUpdate('supplierId', e.target.value)}
              size="sm"
            >
              <option value="">All Suppliers</option>
              {suppliers.map((supplier) => (
                <option key={supplier.supplier_id} value={supplier.supplier_id}>
                  {supplier.supplier_name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Row className="mt-3">
        <Col>
          <Form.Label className="small fw-semibold d-block mb-2">Status</Form.Label>
          <div className="d-flex flex-wrap gap-2">
            {statusOptions.map((option) => {
              const isSelected = filters.status.includes(option.value)
              return (
                <Badge
                  key={option.value}
                  bg={isSelected ? option.variant : 'light'}
                  text={isSelected ? 'white' : 'dark'}
                  className="px-3 py-2 cursor-pointer border"
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => handleStatusToggle(option.value)}
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

PurchaseOrdersFilter.propTypes = {
  onFilterChange: PropTypes.func.isRequired,
  branches: PropTypes.arrayOf(
    PropTypes.shape({
      branch_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      branch_name: PropTypes.string.isRequired,
    })
  ).isRequired,
  suppliers: PropTypes.arrayOf(
    PropTypes.shape({
      supplier_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      supplier_name: PropTypes.string.isRequired,
    })
  ).isRequired,
}

export default PurchaseOrdersFilter
