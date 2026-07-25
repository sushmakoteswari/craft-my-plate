const Order = require('../models/Order');
const Menu = require('../models/Menu');
const { trace } = require('@opentelemetry/api');
const {
  getLogger,
  rbacDeniedTotal,
  inventoryConflictTotal,
  ordersPlacedTotal,
} = require('../tracing');

const logger = getLogger();

function denyUnlessAdminOrManager(req, res) {
  if (req.user.role !== 'admin' && req.user.role !== 'manager') {
    const span = trace.getActiveSpan();
    if (span) {
      span.addEvent('rbac.denied', {
        'user.id': req.user._id.toString(),
        'user.role': req.user.role,
        'attempted.route': req.method + ' ' + req.originalUrl,
        'required.role': 'admin,manager',
      });
      span.setAttribute('rbac.denied', true);
    }
    rbacDeniedTotal.add(1, {
      'attempted.route': req.method + ' ' + req.originalUrl,
      'user.role': req.user.role,
    });
    logger.emit({
      severityText: 'WARN',
      body: 'RBAC denied',
      attributes: {
        'user.role': req.user.role,
        'attempted.route': req.method + ' ' + req.originalUrl,
      },
    });
    res.status(403).json({ message: 'Access denied' });
    return true;
  }
  return false;
}

function availableQuantity(menuItem) {
  if (menuItem.availability === false) {
    return 0;
  }
  return typeof menuItem.stock === 'number' ? menuItem.stock : 50;
}

// Place a new order
const placeOrder = async (req, res) => {
  try {
    console.log("User in request:", req.user);

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized: Missing user ID" });
    }

    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Order must contain at least one item" });
    }

    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      if (!item.menuItem || !item.quantity) {
        return res.status(400).json({ message: "Invalid order: Menu item and quantity are required" });
      }

      const menuItem = await Menu.findById(item.menuItem);
      if (!menuItem) {
        return res.status(404).json({ message: `Menu item not found: ${item.menuItem}` });
      }

      const availableQty = availableQuantity(menuItem);
      if (item.quantity > availableQty) {
        const span = trace.getActiveSpan();
        if (span) {
          span.addEvent('inventory.conflict', {
            'item.id': menuItem._id.toString(),
            'item.name': menuItem.name,
            'requested.quantity': item.quantity,
            'available.quantity': availableQty,
          });
          span.setAttribute('inventory.conflict', true);
        }
        inventoryConflictTotal.add(1, {
          'item.name': menuItem.name,
          'item.id': menuItem._id.toString(),
        });
        logger.emit({
          severityText: 'ERROR',
          body: 'Inventory conflict',
          attributes: {
            'item.name': menuItem.name,
            'requested.quantity': item.quantity,
            'available.quantity': availableQty,
          },
        });
        ordersPlacedTotal.add(1, { status: 'stock_conflict' });
        return res.status(409).json({ message: `Not enough stock for ${menuItem.name}` });
      }

      totalAmount += menuItem.price * item.quantity;
      validatedItems.push({
        menuItem: menuItem._id,
        quantity: item.quantity,
      });
    }

    const newOrder = new Order({
      userId: req.user._id,
      items: validatedItems,
      totalAmount,
    });

    await newOrder.save();

    for (const line of validatedItems) {
      await Menu.findByIdAndUpdate(line.menuItem, { $inc: { stock: -line.quantity } });
    }

    ordersPlacedTotal.add(1, { status: 'success' });
    res.status(201).json(newOrder);
  } catch (error) {
    console.error("Order placement error:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Get orders of the logged-in user
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate('items.menuItem')
      .sort({ createdAt: -1 });

    const formattedOrders = orders.map(order => ({
      _id: order._id,
      totalAmount: order.totalAmount,
      status: order.status,
      date: order.createdAt.toISOString().split('T')[0],
      items: order.items.map(item => ({
        id: item.menuItem._id,
        name: item.menuItem.name,
        qty: item.quantity,
        price: item.menuItem.price
      }))
    }));

    res.json(formattedOrders);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllOrders = async (req, res) => {
  try {
    if (denyUnlessAdminOrManager(req, res)) return;

    const orders = await Order.find().populate("items.menuItem").sort({ createdAt: -1 });

    const formattedOrders = orders.map(order => ({
      _id: order._id,
      customer: order.userId.name,
      totalAmount: order.totalAmount,
      status: order.status,
      date: order.createdAt.toISOString().split("T")[0],
      items: order.items.map(item => ({
        id: item.menuItem._id,
        name: item.menuItem.name,
        qty: item.quantity,
        price: item.menuItem.price
      }))
    }));

    res.json(formattedOrders);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (denyUnlessAdminOrManager(req, res)) return;

  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  placeOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
};
