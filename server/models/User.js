const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  role: {
    type: String,
    enum: ['engineer', 'manager'],
    required: true
  },
  // Engineer specific fields
  skills: {
    type: [String],
    default: []
  },
  seniority: {
    type: String,
    enum: ['junior', 'mid', 'senior'],
    default: 'mid'
  },
  title: {
    type: String,
    default: function() {
      // Generate title based on seniority and department
      return `${this.seniority.charAt(0).toUpperCase() + this.seniority.slice(1)} ${this.department} Engineer`;
    }
  },
  maxCapacity: {
    type: Number,
    default: 100 // 100 for full-time, 50 for part-time
  },
  department: {
    type: String,
    default: 'Engineering'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
  // If password is already hashed (60 chars is bcrypt's standard length), skip hashing
  if (this.password && this.password.length === 60 && this.password.startsWith('$2')) {
    return next();
  }
  
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
