const Order = require('../models/Order');
const Menu = require('../models/Menu');

// Place a new order
const placeOrder = async (req, res) => {
  try {
    console.log("User in request:", req.user); // Log user object

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

      totalAmount += menuItem.price * item.quantity;
      validatedItems.push({
        menuItem: menuItem._id,
        quantity: item.quantity,
      });
    }

    const newOrder = new Order({
      userId: req.user._id, // Ensure userId is being used correctly
      items: validatedItems,
      totalAmount,
    });

    await newOrder.save();
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
      date: order.createdAt.toISOString().split('T')[0], // Formats as YYYY-MM-DD
      items: order.items.map(item => ({
        id: item.menuItem._id,
        name: item.menuItem.name,
        qty: item.quantity, // ✅ Ensure quantity is included
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
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const orders = await Order.find().populate("items.menuItem").sort({ createdAt: -1 });

    const formattedOrders = orders.map(order => ({
      _id: order._id,
      customer: order.userId.name, // Assuming user has a name field
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

  // Check if the user has the 'admin' or 'manager' role
  if (req.user.role !== 'admin' && req.user.role !== 'manager') {
    return res.status(403).json({ message: 'Access denied' });
  }

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
