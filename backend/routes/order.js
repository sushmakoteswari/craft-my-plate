const express = require('express');
const {
  placeOrder,
  getUserOrders,
  updateOrderStatus,
  getAllOrders,
} = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, placeOrder);
router.get('/', authMiddleware, getUserOrders);
router.get('/allorders', authMiddleware, getAllOrders);
router.put('/:id/status', authMiddleware, updateOrderStatus);

module.exports = router;
