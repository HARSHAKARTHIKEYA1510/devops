const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

// @desc    Create order
// @route   POST /api/orders
exports.createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod, couponCode, notes } = req.body;

    // Validate stock & calculate subtotal
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive) {
        return res.status(400).json({ success: false, message: `Product not found: ${item.product}` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
      }
      subtotal += product.price * item.quantity;
      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images?.[0]?.url || '',
        price: product.price,
        quantity: item.quantity,
        size: item.size || '',
        color: item.color || '',
      });
    }

    const shippingCost = subtotal >= 999 ? 0 : 99;
    const taxAmount = Math.round(subtotal * 0.18);
    let discount = 0;
    let couponApplied = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon) {
        const now = new Date();
        if (coupon.expiresAt && coupon.expiresAt < now) {
          return res.status(400).json({ success: false, message: 'Coupon expired' });
        }
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
          return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
        }
        if (subtotal < coupon.minOrderAmount) {
          return res.status(400).json({ success: false, message: `Minimum order ₹${coupon.minOrderAmount} required` });
        }
        if (coupon.usersUsed.includes(req.user._id)) {
          return res.status(400).json({ success: false, message: 'Coupon already used' });
        }
        discount = coupon.discountType === 'percentage'
          ? Math.round((subtotal * coupon.discountValue) / 100)
          : coupon.discountValue;
        if (coupon.maxDiscountAmount) discount = Math.min(discount, coupon.maxDiscountAmount);
        coupon.usedCount += 1;
        coupon.usersUsed.push(req.user._id);
        await coupon.save();
        couponApplied = couponCode;
      }
    }

    const total = subtotal + shippingCost + taxAmount - discount;
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      subtotal,
      shippingCost,
      taxAmount,
      discount,
      total,
      couponCode: couponApplied,
      paymentMethod,
      notes,
    });

    // Reduce stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity, soldCount: item.quantity },
      });
    }

    res.status(201).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user orders
// @route   GET /api/orders/my
exports.getMyOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = { user: req.user._id };
    if (status) query.orderStatus = status;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('items.product', 'name images');

    res.status(200).json({ success: true, total, orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product', 'name images slug');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (!['placed', 'confirmed'].includes(order.orderStatus)) {
      return res.status(400).json({ success: false, message: 'Cannot cancel this order' });
    }
    order.orderStatus = 'cancelled';
    order.cancelledAt = Date.now();
    order.cancelReason = req.body.reason || 'Customer request';
    await order.save();

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }
    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// ===================== ADMIN =====================

// @desc    Get all orders (Admin)
// @route   GET /api/orders/admin/all
exports.getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = {};
    if (status) query.orderStatus = status;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('user', 'name email');

    res.status(200).json({ success: true, total, orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/admin/:id/status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        orderStatus: req.body.status,
        ...(req.body.status === 'delivered' ? { deliveredAt: Date.now() } : {}),
        ...(req.body.trackingNumber ? { trackingNumber: req.body.trackingNumber } : {}),
        ...(req.body.paymentStatus ? { paymentStatus: req.body.paymentStatus } : {}),
      },
      { new: true }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin dashboard stats
// @route   GET /api/orders/admin/stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
    ]);
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email');
    const topProducts = await Product.find({ isActive: true }).sort({ soldCount: -1 }).limit(5);

    const monthlyRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        ordersByStatus,
        recentOrders,
        topProducts,
        monthlyRevenue,
      },
    });
  } catch (error) {
    next(error);
  }
};
