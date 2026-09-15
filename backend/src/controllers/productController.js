const Product = require('../models/Product');
const { uploadToCloudinary, deleteFromCloudinary } = require('../middleware/upload');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    const {
      keyword,
      category,
      minPrice,
      maxPrice,
      page = 1,
      limit = 12,
      sort = '-createdAt',
      featured,
    } = req.query;

    const query = { isActive: true };

    if (keyword && typeof keyword === 'string') {
      query.$text = { $search: keyword };
    }

    if (category && typeof category === 'string') {
      query.category = category;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    // Only show available products to customers
    if (!req.user || req.user.role !== 'admin') {
      query.importationStatus = 'available';
      query.stock = { $gt: 0 };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const products = await Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .populate('createdBy', 'name');

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      'createdBy',
      'name'
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create product (supports multiple image upload)
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res, next) => {
  try {
    req.body.createdBy = req.user.id;

    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) =>
        uploadToCloudinary(file.buffer, 'ecommerce-importation/products')
      );
      const uploadedImages = await Promise.all(uploadPromises);
      req.body.images = uploadedImages;
    } else {
      req.body.images = [];
    }

    // Parse numeric / boolean fields (FormData sends everything as string)
    if (req.body.price) req.body.price = Number(req.body.price);
    if (req.body.compareAtPrice)
      req.body.compareAtPrice = Number(req.body.compareAtPrice);
    if (req.body.stock) req.body.stock = Number(req.body.stock);
    if (req.body.isFeatured !== undefined) {
      req.body.isFeatured =
        req.body.isFeatured === 'true' || req.body.isFeatured === true;
    }

    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product (can add more images)
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Handle new uploaded images (append to existing)
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) =>
        uploadToCloudinary(file.buffer, 'ecommerce-importation/products')
      );
      const uploadedImages = await Promise.all(uploadPromises);

      const existingImages = product.images || [];
      req.body.images = [...existingImages, ...uploadedImages];
    }

    // Parse numeric / boolean fields
    if (req.body.price) req.body.price = Number(req.body.price);
    if (req.body.compareAtPrice)
      req.body.compareAtPrice = Number(req.body.compareAtPrice);
    if (req.body.stock) req.body.stock = Number(req.body.stock);
    if (req.body.isFeatured !== undefined) {
      req.body.isFeatured =
        req.body.isFeatured === 'true' || req.body.isFeatured === true;
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a specific product image
// @route   DELETE /api/products/:id/images/:publicId
// @access  Private/Admin
exports.deleteProductImage = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const publicId = decodeURIComponent(req.params.publicId);

    // Remove from Cloudinary
    await deleteFromCloudinary(publicId);

    // Remove from product
    product.images = (product.images || []).filter(
      (img) => img.public_id !== publicId
    );
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product (soft delete)
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Soft delete
    product.isActive = false;
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get product categories
// @route   GET /api/products/categories/list
// @access  Public
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Product.distinct('category', { isActive: true });
    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};
