const express = require('express');
const {
  listUsers,
  getUser,
  updateUser,
  updateMedicalHistory,
  deleteUser,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, authorize('admin'), listUsers);
router.get('/:id', protect, getUser);
router.put('/:id', protect, updateUser);
router.put('/:id/medical-history', protect, updateMedicalHistory);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
