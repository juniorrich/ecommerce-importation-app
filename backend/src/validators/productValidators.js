const { body } = require('express-validator');

const importationStatuses = [
  'sourcing', 'purchased', 'in_transit', 'customs', 'arrived', 'in_warehouse', 'available',
];
const customsStatuses = ['pending', 'cleared', 'held'];

exports.createProductRules = [
  body('name').trim().notEmpty().withMessage('Product name is required')
    .isLength({ max: 200 }).withMessage('Product name is too long'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  body('compareAtPrice').optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage('Invalid compare-at price'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('originCountry').optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
  body('importationStatus').optional().isIn(importationStatuses).withMessage('Invalid importation status'),
  body('customsStatus').optional().isIn(customsStatuses).withMessage('Invalid customs status'),
  body('warehouseLocation').optional({ checkFalsy: true }).trim().isLength({ max: 200 }),
  body('isFeatured').optional().isBoolean().withMessage('isFeatured must be true or false'),
];

exports.updateProductRules = [
  body('name').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Invalid product name'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  body('compareAtPrice').optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage('Invalid compare-at price'),
  body('category').optional().trim().notEmpty().withMessage('Category cannot be empty'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('importationStatus').optional().isIn(importationStatuses).withMessage('Invalid importation status'),
  body('customsStatus').optional().isIn(customsStatuses).withMessage('Invalid customs status'),
  body('isFeatured').optional().isBoolean().withMessage('isFeatured must be true or false'),
];
