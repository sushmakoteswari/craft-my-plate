require('dotenv').config();
const mongoose = require('mongoose');
const Menu = require('../models/Menu');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const burger = await Menu.findOneAndUpdate(
    { name: 'Burger' },
    { $set: { stock: 50, availability: true } },
    { new: true }
  );

  if (!burger) {
    console.error('Menu item "Burger" not found');
    process.exit(1);
  }

  console.log(`Updated ${burger.name}: stock=${burger.stock}, availability=${burger.availability}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
