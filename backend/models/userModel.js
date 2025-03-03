const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema(
  {
    profilepic: { type: String, required: true, default: "" },
    userName: { type: String, required: true, trim: true, lowercase: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: true, trim: true },
    number: { type: String, required: true, trim: true },
    userType: {
      type: String,
      enum: ["buyer", "owner", "agent"],
      required: true,
    },
    credits: { type: Number, default: 0 },
    rating: {
      type: Number,
      default: 0,
    },
    properties: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Property",
      },
    ],
    cart: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cart",
      },
    ],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password during login
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};


// Generate JWT Token
UserSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { _id: this._id, userType: this.userType },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",           
    }
  );
};

// Generate reset password token
UserSchema.methods.generateResetPasswordToken = async function () {
  const resetToken = Math.random().toString(36).slice(-8); // Generate a random 8-character string
  this.resetPasswordToken = await bcrypt.hash(resetToken, 10);
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // Token valid for 15 minutes
  return resetToken;
};

module.exports = mongoose.model("User", UserSchema);
