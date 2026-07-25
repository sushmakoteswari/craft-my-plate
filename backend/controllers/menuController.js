const Menu = require('../models/Menu');
const { trace } = require('@opentelemetry/api');
const {
  getLogger,
  rbacDeniedTotal,
  menuItemsCreatedTotal,
} = require('../tracing');

const logger = getLogger();

// Get all menu items
const getMenuItems = async (req, res) => {
  try {
    const menuItems = await Menu.find();
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Add a new menu item
const addMenuItem = async (req, res) => {
  const { name, category, price, availability } = req.body;

  // Check if the user has the 'admin' role
  if (req.user.role !== 'admin') {
    const span = trace.getActiveSpan();
    if (span) {
      span.addEvent('rbac.denied', {
        'user.id': req.user._id.toString(),
        'user.role': req.user.role,
        'attempted.route': req.method + ' ' + req.originalUrl,
        'required.role': 'admin',
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
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    const newMenuItem = new Menu({
      name,
      category,
      price,
      availability,
    });

    await newMenuItem.save();

    const span = trace.getActiveSpan();
    if (span) {
      span.addEvent('menu.item.created', {
        'item.id': newMenuItem._id.toString(),
        'item.name': newMenuItem.name,
        'item.price': newMenuItem.price,
      });
    }
    menuItemsCreatedTotal.add(1, {
      'item.name': newMenuItem.name,
    });
    logger.emit({
      severityText: 'INFO',
      body: 'Menu item created',
      attributes: {
        'item.name': newMenuItem.name,
        'item.price': newMenuItem.price,
      },
    });

    res.status(201).json(newMenuItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a menu item
const updateMenuItem = async (req, res) => {
  const { id } = req.params;
  const { name, category, price, availability } = req.body;

  // Check if the user has the 'admin' or 'manager' role
  if (req.user.role !== 'admin' && req.user.role !== 'manager') {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    console.log("User role:", req.user.role);
    const updatedMenuItem = await Menu.findByIdAndUpdate(
      id,
      { name, category, price, availability },
      { new: true }
    );

    if (!updatedMenuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.json(updatedMenuItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a menu item
const deleteMenuItem = async (req, res) => {
  const { id } = req.params;

  // Check if the user has the 'admin' role
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    const deletedMenuItem = await Menu.findByIdAndDelete(id);

    if (!deletedMenuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.json({ message: 'Menu item deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getMenuItems,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
};
