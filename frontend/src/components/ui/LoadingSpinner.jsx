import PropTypes from 'prop-types'

const LoadingSpinner = ({ label = 'Loading' }) => {
  return (
    <div className="d-flex flex-column align-items-center gap-2 text-muted">
      <div className="spinner-border text-primary" role="status" aria-hidden="true" />
      <small>{label}…</small>
    </div>
  )
}

LoadingSpinner.propTypes = {
  label: PropTypes.string,
}

export default LoadingSpinner
