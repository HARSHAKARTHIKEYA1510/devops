const mongoose = require('mongoose');
const Product = require('../../models/Product');

describe('Product Model - Unit Tests', () => {
  test('calculateRating should correctly calculate average when there are reviews', () => {
    const product = new Product({
      name: 'Test Product',
      description: 'Test Description',
      price: 100,
      category: 'Electronics',
      reviews: [
        { user: new mongoose.Types.ObjectId(), name: 'User 1', rating: 5, comment: 'Great' },
        { user: new mongoose.Types.ObjectId(), name: 'User 2', rating: 3, comment: 'Average' },
      ],
    });

    product.calculateRating();

    expect(product.rating).toBe(4);
    expect(product.numReviews).toBe(2);
  });

  test('calculateRating should set rating to 0 when there are no reviews', () => {
    const product = new Product({
      name: 'Test Product',
      description: 'Test Description',
      price: 100,
      category: 'Electronics',
      reviews: [],
    });

    product.calculateRating();

    expect(product.rating).toBe(0);
    expect(product.numReviews).toBe(0);
  });
});
