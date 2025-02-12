import { Schema, model } from 'mongoose';

const OfferSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title can not be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  discount: {
    type: Number,
    required: true,
    min: [0, 'Discount can not be negative'],
    max: [100, 'Discount can not be more than 100%']
  },
  shop: {
    type: Schema.ObjectId,
    ref: 'Shop',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default model('Offer', OfferSchema);