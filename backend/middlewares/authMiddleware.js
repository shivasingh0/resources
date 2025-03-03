const jwt = require("jsonwebtoken");
const { ErrorResponse } = require("../utils/apiResponse");

exports.authMiddleware = (req, res, next) => {
  const token = req.cookies.token; // Read token from cookies
  console.log(req.cookies);
  if (!token)
    return res.status(401).json(new ErrorResponse("Unauthorized", 401));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json(new ErrorResponse("Invalid token"));
  }
};

exports.isAdmin = (req, res, next) => {
  const token = req.cookies.token; //read token
  console.log(token);
  if (!token) {
    return res.status(401).json(new ErrorResponse("Unauthorized", 401));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.userType !== "admin") {
      return res.status(401).json(new ErrorResponse("protected by admin", 401));
    }
    req.user = jwt.decode;
    next();
  } catch (error) {
    res
      .status(400)
      .json(new ErrorResponse(`Invalid token: ${error.message}`, 401));
  }
};
