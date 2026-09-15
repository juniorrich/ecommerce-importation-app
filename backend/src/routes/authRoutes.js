const express = require('express');
const {
  register,
  login,
  getMe,
  updateDetails,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  registerRules,
  loginRules,
  updateDetailsRules,
} = require('../validators/authValidators');

const router = express.Router();

router.post('/register', registerRules, validate, register);
router.post('/login', loginRules, validate, login);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetailsRules, validate, updateDetails);

module.exports = router;
