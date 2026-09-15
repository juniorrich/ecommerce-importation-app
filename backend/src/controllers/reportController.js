const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Dashboard overview stats
// @route   GET /api/admin/reports/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    // Parallel queries for performance
    const [
      totalUsers,
      totalCustomers,
      totalAdmins,
      totalProducts,
      activeProducts,
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      revenueData,
      todayOrders,
      monthlyOrders,
      lowStockProducts,
      recentOrders,
      topProducts,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'admin' }),
      Product.countDocuments(),
      Product.countDocuments({ isActive: true, importationStatus: 'available' }),
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'processing' }),
      Order.countDocuments({ status: 'shipped' }),
      Order.countDocuments({ status: 'delivered' }),
      Order.countDocuments({ status: 'cancelled' }),

      // Total revenue (paid orders only)
      Order.aggregate([
        { $match: { isPaid: true } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalPrice' },
            avgOrderValue: { $avg: '$totalPrice' },
          },
        },
      ]),

      // Today's orders & revenue
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfToday },
          },
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            revenue: { $sum: { $cond: ['$isPaid', '$totalPrice', 0] } },
          },
        },
      ]),

      // This month's orders & revenue
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfMonth },
          },
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            revenue: { $sum: { $cond: ['$isPaid', '$totalPrice', 0] } },
          },
        },
      ]),

      // Low stock products
      Product.find({
        isActive: true,
        stock: { $lte: 5 },
      })
        .select('name stock price category')
        .limit(10)
        .sort('stock'),

      // Recent orders
      Order.find()
        .populate('user', 'name email')
        .sort('-createdAt')
        .limit(8)
        .select('user totalPrice status isPaid createdAt orderItems'),

      // Top selling products
      Order.aggregate([
        { $match: { isPaid: true } },
        { $unwind: '$orderItems' },
        {
          $group: {
            _id: '$orderItems.product',
            totalSold: { $sum: '$orderItems.quantity' },
            revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
            name: { $first: '$orderItems.name' },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
      ]),
    ]);

    const revenue = revenueData[0] || { totalRevenue: 0, avgOrderValue: 0 };
    const todayStats = todayOrders[0] || { count: 0, revenue: 0 };
    const monthlyStats = monthlyOrders[0] || { count: 0, revenue: 0 };

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalCustomers,
          totalAdmins,
          totalProducts,
          activeProducts,
          totalOrders,
          totalRevenue: revenue.totalRevenue || 0,
          averageOrderValue: Math.round((revenue.avgOrderValue || 0) * 100) / 100,
        },
        orderStatus: {
          pending: pendingOrders,
          processing: processingOrders,
          shipped: shippedOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders,
        },
        today: {
          orders: todayStats.count,
          revenue: todayStats.revenue,
        },
        thisMonth: {
          orders: monthlyStats.count,
          revenue: monthlyStats.revenue,
        },
        lowStockProducts,
        recentOrders,
        topProducts,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Sales report by date range
// @route   GET /api/admin/reports/sales
// @access  Private/Admin
exports.getSalesReport = async (req, res, next) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    const match = { isPaid: true };

    if (startDate || endDate) {
      match.paidAt = {};
      if (startDate) match.paidAt.$gte = new Date(startDate);
      if (endDate) match.paidAt.$lte = new Date(endDate);
    }

    let dateFormat;
    switch (groupBy) {
      case 'month':
        dateFormat = { year: { $year: '$paidAt' }, month: { $month: '$paidAt' } };
        break;
      case 'week':
        dateFormat = { year: { $year: '$paidAt' }, week: { $week: '$paidAt' } };
        break;
      default:
        dateFormat = {
          year: { $year: '$paidAt' },
          month: { $month: '$paidAt' },
          day: { $dayOfMonth: '$paidAt' },
        };
    }

    const sales = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: dateFormat,
          orders: { $sum: 1 },
          revenue: { $sum: '$totalPrice' },
          itemsSold: { $sum: { $size: '$orderItems' } },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: sales,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Inventory / Importation status report
// @route   GET /api/admin/reports/inventory
// @access  Private/Admin
exports.getInventoryReport = async (req, res, next) => {
  try {
    const byStatus = await Product.aggregate([
      {
        $group: {
          _id: '$importationStatus',
          count: { $sum: 1 },
          totalStock: { $sum: '$stock' },
          totalValue: { $sum: { $multiply: ['$price', '$stock'] } },
        },
      },
    ]);

    const byCategory = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalStock: { $sum: '$stock' },
          avgPrice: { $avg: '$price' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const lowStock = await Product.find({
      isActive: true,
      stock: { $lte: 10 },
    })
      .select('name stock price category importationStatus')
      .sort('stock');

    res.status(200).json({
      success: true,
      data: {
        byImportationStatus: byStatus,
        byCategory,
        lowStockProducts: lowStock,
      },
    });
  } catch (error) {
    next(error);
  }
};
