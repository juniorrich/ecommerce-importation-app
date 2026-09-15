const express = require('express');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteProductImage,
  getCategories,
} = require('../controllers/productController');
const { protect, optionalAuth, authorize } = require('../middleware/auth');
const { uploadMultiple } = require('../middleware/upload');
const validate = require('../middleware/validate');
const {
  createProductRules,
  updateProductRules,
} = require('../validators/productValidators');

const router = express.Router();

router.route('/categories/list').get(getCategories);

router
  .route('/')
  .get(optionalAuth, getProducts)
  .post(protect, authorize('admin'), uploadMultiple, createProductRules, validate, createProduct);

router
  .route('/:id')
  .get(getProduct)
  .put(protect, authorize('admin'), uploadMultiple, updateProductRules, validate, updateProduct)
  .delete(protect, authorize('admin'), deleteProduct);

// Delete a specific image from a product
router
  .route('/:id/images/:publicId')
  .delete(protect, authorize('admin'), deleteProductImage);

module.exports = router;
