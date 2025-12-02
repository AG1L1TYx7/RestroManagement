const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { authenticate } = require('../middleware/auth');
const { staffAccess, managerAccess } = require('../middleware/rbac');
const { reservationValidation, reservationStatusValidation, validate } = require('../utils/validators');

/**
 * @route   GET /api/v1/reservations/stats
 * @desc    Get reservation statistics
 * @access  Private (Manager/Admin)
 */
router.get(
    '/stats',
    authenticate,
    managerAccess,
    reservationController.getReservationStatistics
);

/**
 * @route   GET /api/v1/reservations/upcoming
 * @desc    Get upcoming reservations
 * @access  Private (Staff/Manager/Admin)
 */
router.get(
    '/upcoming',
    authenticate,
    staffAccess,
    reservationController.getUpcomingReservations
);

/**
 * @route   POST /api/v1/reservations
 * @desc    Create a new reservation
 * @access  Private (Staff/Manager/Admin)
 */
router.post(
    '/',
    authenticate,
    staffAccess,
    reservationValidation,
    validate,
    reservationController.createReservation
);

/**
 * @route   GET /api/v1/reservations
 * @desc    Get all reservations (with filtering)
 * @access  Private (Staff/Manager/Admin)
 */
router.get(
    '/',
    authenticate,
    staffAccess,
    reservationController.getAllReservations
);

/**
 * @route   GET /api/v1/reservations/:id
 * @desc    Get reservation by ID
 * @access  Private (Staff/Manager/Admin)
 */
router.get(
    '/:id',
    authenticate,
    staffAccess,
    reservationController.getReservationById
);

/**
 * @route   PUT /api/v1/reservations/:id
 * @desc    Update reservation
 * @access  Private (Staff/Manager/Admin)
 */
router.put(
    '/:id',
    authenticate,
    staffAccess,
    reservationValidation,
    validate,
    reservationController.updateReservation
);

/**
 * @route   PUT /api/v1/reservations/:id/status
 * @desc    Update reservation status
 * @access  Private (Staff/Manager/Admin)
 */
router.put(
    '/:id/status',
    authenticate,
    staffAccess,
    reservationStatusValidation,
    validate,
    reservationController.updateReservationStatus
);

/**
 * @route   DELETE /api/v1/reservations/:id/cancel
 * @desc    Cancel reservation
 * @access  Private (Staff/Manager/Admin)
 */
router.delete(
    '/:id/cancel',
    authenticate,
    staffAccess,
    reservationController.cancelReservation
);

/**
 * @route   DELETE /api/v1/reservations/:id
 * @desc    Delete reservation
 * @access  Private (Manager/Admin)
 */
router.delete(
    '/:id',
    authenticate,
    managerAccess,
    reservationController.deleteReservation
);

module.exports = router;
