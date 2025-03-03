const User = require("../../models/userModel");
const bcrypt = require("bcryptjs");
const { ErrorResponse, SuccessResponse } = require("../../utils/apiResponse");
const { sendEmail } = require("../../config/mailer");

/**
 * @DESC Register a new user
 * @ROUTE @POST /api/v1/auth/register
 * @ACCESS Public
 */
exports.register = async (req, res) => {
  try {
    const { userName, email, number, password, userType } = req.body;

    // Basic Validations
    if (!userName || !email || !password || !number || !userType) {
      return res.status(400).json(new ErrorResponse("All fields are required"));
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json(new ErrorResponse("Invalid email format"));
    }
    if (password.length < 6) {
      return res.json(
        new ErrorResponse("Password must be at least 6 characters")
      );
    }
    if (!/^[6789]\d{9}$/.test(number)) {
      return res.json(new ErrorResponse("Invalid phone number format"));
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json(new ErrorResponse("User already exists", 400));
    }

    // Create and save the new user
    const user = new User({
      userName,
      email,
      password,
      number,
      userType,
    });
    await user.save();

    console.log("user", user.userName);

    const templateData = {
      name: user.userName,
      loginLink: `${process.env.FRONTEND_URL}/login`,
    };

    console.log("templateData.name", templateData.name);

    // Send reset password email
    await sendEmail(
      user.email,
      "welcome",
      "Welcome to Maan-Homes",
      templateData
    );

    return res.status(201).json(
      new SuccessResponse(
        "User registered successfully",
        {
          id: user._id,
          userName: user.userName,
          email: user.email,
          number: user.number,
          userType: user.userType,
        },
        201
      )
    );
  } catch (error) {
    console.error("Registration Error:", error);
    return res
      .status(500)
      .json(new ErrorResponse("Internal server error", 500));
  }
};

/**
 * @DESC Login a user
 * @ROUTE @POST /api/v1/auth/login
 * @ACCESS Public
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // console.log(email, password)

    // Basic Validations
    if (!email || !password) {
      return res
        .status(400)
        .json(new ErrorResponse("Email and password are required"));
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json(new ErrorResponse("Invalid email format"));
    }

    // Find user by email
    const user = await User.findOne({ email });
    // console.log("user", user)
    if (!user) {
      return res.status(400).json(new ErrorResponse("Invalid email"));
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json(new ErrorResponse("Invalid password"));
    }

    // Generate token
    const token = user.generateAuthToken();

    // set token in cookies
    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      secure: process.env.NODE_ENV === "production",
      // sameSite: "strict",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    });

    // Return success response with user data
    return res.json(
      new SuccessResponse("Login successful", {
        userType: user.userType,
        userName: user.userName,
        email: user.email,
      })
    );
  } catch (error) {
    console.error("Login Error:", error);
    return res
      .status(500)
      .json(new ErrorResponse("Internal server error", 500));
  }
};

/**
 * @DESC Update a user
 * @ROUTE @POST /api/v2/auth/update/:id
 * @ACCESS Private
 */
exports.updateUser = async (req, res) => {
  try {
    const { userName, email, number, userType } = req.body;
    const userId = req.params.id;

    // Validate input
    if (!userId) {
      return res.status(400).json(new ErrorResponse("User ID is required"));
    }
    if (!userName && !email && !number && !userType) {
      return res
        .status(400)
        .json(new ErrorResponse("At least one field is required to update"));
    }
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json(new ErrorResponse("Invalid email format"));
    }
    if (number && !/^[6789]\d{9}$/.test(number)) {
      return res
        .status(400)
        .json(new ErrorResponse("Invalid Indian mobile number format"));
    }

    // Find user and update
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { userName, email, number, userType },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json(new ErrorResponse("User not found", 404));
    }

    return res.json(
      new SuccessResponse("User updated successfully", updatedUser)
    );
  } catch (error) {
    console.error("Update Error:", error);
    return res
      .status(500)
      .json(new ErrorResponse("Internal server error", 500));
  }
};

/**
 * @DESC Delete a user
 * @ROUTE @POST /api/v2/auth/delete/:id
 * @ACCESS Private
 */
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Validate input
    if (!userId) {
      return res.status(400).json(new ErrorResponse("User ID is required"));
    }

    // Find user and delete
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json(new ErrorResponse("User not found", 404));
    }

    return res.json(new SuccessResponse("User deleted successfully"));
  } catch (error) {
    console.error("Delete Error:", error);
    return res
      .status(500)
      .json(new ErrorResponse("Internal server error", 500));
  }
};

/**
 * @DESC Forgot password
 * @ROUTE @POST /api/v1/auth/forgot
 * @ACCESS Public
 */

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate input
    if (!email) {
      return res.status(400).json(new ErrorResponse("Email is required"));
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json(new ErrorResponse("Invalid email format"));
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json(new ErrorResponse("User not found", 404));
    }

    // Generate reset token
    const resetToken = await user.generateResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/v1/user/reset-password/${resetToken}`;

    const templateData = {
      name: user.userName,
      resetLink: resetUrl,
      expiryTime: "15 min",
    };

    // Send reset password email
    await sendEmail(
      user.email,
      "forgotPassword",
      "Reset your password",
      templateData
    );

    return res.json(
      new SuccessResponse("Password reset email sent successfully")
    );
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res
      .status(500)
      .json(new ErrorResponse("Internal server error", 500));
  }
};

/**
 * @DESC Reset password
 * @ROUTE @POST /api/v1/auth/reset
 * @ACCESS Public
 */

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json(new ErrorResponse("Password is required"));
    }

    const user = await User.findOne({
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user || !(await bcrypt.compare(token, user.resetPasswordToken))) {
      return res.status(400).json(new ErrorResponse("Invalid token"));
    }

    // Hash new password
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    const templateData = {
      name: user.userName,
    };

    // Send reset password email
    await sendEmail(
      user.email,
      "recoveryPasswordSuccess",
      "You have successfully reset your password",
      templateData
    );

    return res
      .status(200)
      .json(new SuccessResponse("Password reset successfully"));
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res
      .status(500)
      .json(new ErrorResponse("Internal server error", 500));
  }
};

/**
 * @DESC logout user
 * @ROUTE @POST /api/v2/auth/logout
 * @ACCESS Private
 */

exports.logout = async (req, res) => {
  try {
    await res.cookie("token", null, {
      httpOnly: true,
      expires: new Date(Date.now()),
      secure: process.env.NODE_ENV === "production",
      // sameSite: "strict",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    });
    return res.json(
      new SuccessResponse("Logged out successfully", null, 200)
    );
  } catch (error) {
    res.status(500).json(new ErrorResponse(error.message, 500));
  }
};

/**
 * @DESC User profile
 * @ROUTE @POST /api/v2/auth/me
 * @ACCESS Private
 */

exports.userProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json(new ErrorResponse("User not found", 404));
    }
    return res.json(new SuccessResponse("User profile", user));
  } catch (error) {
    res.status(500).json(new ErrorResponse(error.message, 500));
  }
};
