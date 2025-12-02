import PropTypes from 'prop-types'
import classNames from 'classnames'
import { Card } from 'react-bootstrap'

const KPICard = ({ title, value, subValue, icon, trend }) => {
  const hasTrend = typeof trend?.value === 'number'
  const trendClass = hasTrend ? (trend.value >= 0 ? 'text-success' : 'text-danger') : ''
  const trendLabel = hasTrend ? `${trend.value >= 0 ? '+' : ''}${trend.value.toFixed(1)}% ${trend.label || 'vs prior'}` : null

  return (
    <Card className="border-0 shadow-sm h-100">
      <Card.Body>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <small className="text-uppercase text-muted fw-semibold">{title}</small>
            {subValue && <div className="text-muted-sm">{subValue}</div>}
          </div>
          {icon && (
            <div className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center" style={{ width: 44, height: 44 }}>
              <i className={classNames('bi fs-5', icon)} aria-hidden="true" />
            </div>
          )}
        </div>
        <h3 className="fw-semibold mb-1">{value}</h3>
        {trendLabel && <small className={classNames('fw-semibold', trendClass)}>{trendLabel}</small>}
      </Card.Body>
    </Card>
  )
}

KPICard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  subValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  icon: PropTypes.string,
  trend: PropTypes.shape({
    value: PropTypes.number.isRequired,
    label: PropTypes.string,
  }),
}

export default KPICard
