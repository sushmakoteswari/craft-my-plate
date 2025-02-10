const Menu = require('../models/Menu');

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
