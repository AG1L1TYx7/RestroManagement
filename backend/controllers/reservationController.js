const Reservation = require('../models/Reservation');
const Table = require('../models/Table');

exports.createReservation = async (req, res) => {
  try {
    const {
      table_id,
      customer_name,
      customer_phone,
      customer_email,
      party_size,
      reservation_date,
      duration_minutes,
      special_requests
    } = req.body;

    const reservation = await Reservation.create({
      table_id,
      customer_name,
      customer_phone,
      customer_email,
      party_size,
      reservation_date,
      duration_minutes,
      special_requests,
      created_by: req.user.user_id
    });

    res.status(201).json({
      success: true,
      message: 'Reservation created successfully',
      data: reservation
    });
  } catch (error) {
    console.error('Create reservation error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create reservation'
    });
  }
};

exports.getAllReservations = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      table_id: req.query.table_id,
      customer_phone: req.query.customer_phone,
      date: req.query.date,
      from_date: req.query.from_date,
      to_date: req.query.to_date,
      limit: req.query.limit,
      offset: req.query.offset
    };

    const reservations = await Reservation.findAll(filters);

    res.json({
      success: true,
      count: reservations.length,
      data: reservations
    });
  } catch (error) {
    console.error('Get all reservations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve reservations'
    });
  }
};

exports.getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    res.json({
      success: true,
      data: reservation
    });
  } catch (error) {
    console.error('Get reservation by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve reservation'
    });
  }
};

exports.getUpcomingReservations = async (req, res) => {
  try {
    const hoursAhead = req.query.hours || 24;
    const reservations = await Reservation.findUpcoming(parseInt(hoursAhead));

    res.json({
      success: true,
      count: reservations.length,
      data: reservations
    });
  } catch (error) {
    console.error('Get upcoming reservations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve upcoming reservations'
    });
  }
};

exports.updateReservation = async (req, res) => {
  try {
    const {
      table_id,
      customer_name,
      customer_phone,
      customer_email,
      party_size,
      reservation_date,
      duration_minutes,
      special_requests,
      status
    } = req.body;

    const reservation = await Reservation.update(req.params.id, {
      table_id,
      customer_name,
      customer_phone,
      customer_email,
      party_size,
      reservation_date,
      duration_minutes,
      special_requests,
      status
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    res.json({
      success: true,
      message: 'Reservation updated successfully',
      data: reservation
    });
  } catch (error) {
    console.error('Update reservation error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update reservation'
    });
  }
};

exports.updateReservationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const reservation = await Reservation.updateStatus(req.params.id, status);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    // If seated, update table status to occupied
    if (status === 'seated') {
      await Table.updateStatus(reservation.table_id, 'occupied');
    }

    // If completed or cancelled, update table status to available
    if (status === 'completed' || status === 'cancelled' || status === 'no-show') {
      await Table.updateStatus(reservation.table_id, 'available');
    }

    res.json({
      success: true,
      message: 'Reservation status updated successfully',
      data: reservation
    });
  } catch (error) {
    console.error('Update reservation status error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to update reservation status'
    });
  }
};

exports.cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    if (['completed', 'cancelled', 'no-show'].includes(reservation.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a reservation that is already completed, cancelled, or no-show'
      });
    }

    const cancelled = await Reservation.cancel(req.params.id);

    // Update table status to available
    await Table.updateStatus(reservation.table_id, 'available');

    res.json({
      success: true,
      message: 'Reservation cancelled successfully',
      data: cancelled
    });
  } catch (error) {
    console.error('Cancel reservation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel reservation'
    });
  }
};

exports.deleteReservation = async (req, res) => {
  try {
    const deleted = await Reservation.delete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }

    res.json({
      success: true,
      message: 'Reservation deleted successfully'
    });
  } catch (error) {
    console.error('Delete reservation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete reservation'
    });
  }
};

exports.getReservationStatistics = async (req, res) => {
  try {
    const filters = {
      from_date: req.query.from_date,
      to_date: req.query.to_date
    };

    const stats = await Reservation.getStatistics(filters);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get reservation statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve reservation statistics'
    });
  }
};
