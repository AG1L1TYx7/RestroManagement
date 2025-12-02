import { Form } from 'react-bootstrap'

const TablesFilter = ({ onFilterChange }) => {
  const handleFilterChange = (e) => {
    const { name, value } = e.target
    onFilterChange((prev) => ({
      ...prev,
      [name]: value || undefined,
    }))
  }

  return (
    <div className="bg-light p-3 rounded">
      <div className="row g-3">
        <div className="col-md-4">
          <Form.Label htmlFor="status">Status</Form.Label>
          <Form.Select
            id="status"
            name="status"
            onChange={handleFilterChange}
          >
            <option value="">All Statuses</option>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="reserved">Reserved</option>
          </Form.Select>
        </div>
        
        <div className="col-md-4">
          <Form.Label htmlFor="location">Location</Form.Label>
          <Form.Control
            type="text"
            id="location"
            name="location"
            placeholder="Filter by location"
            onChange={handleFilterChange}
          />
        </div>

        <div className="col-md-4">
          <Form.Label htmlFor="minCapacity">Min Capacity</Form.Label>
          <Form.Control
            type="number"
            id="minCapacity"
            name="minCapacity"
            placeholder="e.g., 2"
            min="1"
            onChange={handleFilterChange}
          />
        </div>
      </div>
    </div>
  )
}

export default TablesFilter
