const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const medicalHistorySchema = new mongoose.Schema(
  {
    bloodType: { type: String, enum: ['', 'A', 'B', 'AB', 'O', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], default: '' },
    allergies: { type: [String], default: [] },
    conditions: { type: [String], default: [] },
    currentMedications: { type: [String], default: [] },
    notes: { type: String, default: '', trim: true },
    updatedAt: { type: Date },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    password: { type: String, required: [true, 'Password is required'], minlength: 6, select: false },
    phone: { type: String, trim: true },
    role: {
      type: String,
      enum: ['patient', 'dentist', 'admin'],
      default: 'patient',
    },
    avatar: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['', 'male', 'female'], default: '' },
    address: { type: String, default: '', trim: true },
    medicalHistory: { type: medicalHistorySchema, default: () => ({}) },
    resetPasswordTokenHash: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
