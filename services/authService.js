import { create, findOne } from '../models/user';
import { create as _create } from '../models/shop';

export async function registerUser(userData) {
  const shop = await _create({ name: userData.shopName, address: userData.shopAddress });
  const user = await create({ 
    email: userData.email, 
    password: userData.password,
    shop: shop._id
  });
  return user;
}

export async function loginUser(email, password) {
  const user = await findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    throw new Error('Invalid credentials');
  }
  return user;
}