const Admin = require("../../models/adminModel");
const { ErrorResponse, SuccessResponse } = require("../../utils/apiResponse");

/**
 * @DESC Register a new admin only created on  entering right loginKey from server
 * @ROUTE @POST /api/v3/admin/register
 * @ACCESS Private
 */
exports.registerAdmin = async (req, res) => {
  const { loginKey, name, email, password, number } = req.body;
  let profilePic = req.body;
  if (!profilePic) {
    profilePic = "";
  }
  const key = process.env.LOGIN_KEY;
  if (loginKey !== key) {
    return res.status(401).json(new ErrorResponse("Invalid login key ", 401));
  }
  try {
    // basic validation
    if (!name || !email || !password || !number) {
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

    //check for exsiting admin
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res
        .status(400)
        .json(new ErrorResponse("Admin already exists", 400));
    }

    const admin = await Admin.create({
      name,
      email,
      password,
      profilePic,
      number,
    });
    const registerDetails = admin.toObject();
    delete registerDetails.password;
    res
      .status(201)
      .json(
        new SuccessResponse(
          "Admin register successfully!",
          registerDetails,
          500
        )
      );
  } catch (error) {
    res.status(500).json(new ErrorResponse(error.message, 500));
  }
};

/**
 * @DESC login admin api
 * @ROUTE @POST /api/v1/admin/login
 * @ACCESS Puplic
 */

exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res
        .status(404)
        .json(new ErrorResponse("Invalid email or password", 404));
    }
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res
        .status(404)
        .json(new ErrorResponse("Invalid email or password", 404));
    }
    const token = await admin.generateAuthToken();
    // set token in cookies
    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    const adminDetails = admin.toObject();
    delete adminDetails.password;
    res
      .status(200)
      .json(
        new SuccessResponse("Admin login successfully!", adminDetails, 200)
      );
  } catch (error) {
    res.status(500).json(new ErrorResponse(error.message, 500));
  }
};
