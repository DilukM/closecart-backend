const User = require('../models/user');
const Shop = require('../models/shop');

exports.registerUser = async (userData) => {
  const shop = await Shop.create({ name: userData.shopName, address: userData.shopAddress });
  const user = await User.create({ 
    email: userData.email, 
    password: userData.password,
    shop: shop._id
  });
  return user;
};

exports.loginUser = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    throw new Error('Invalid credentials');
  }
  return user;
};