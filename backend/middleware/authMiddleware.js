const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { trace } = require("@opentelemetry/api");
const { getLogger } = require("../tracing");

const logger = getLogger();

function recordAuthFailure(reason) {
  const span = trace.getActiveSpan();
  if (span) {
    span.addEvent("auth.failed", { reason });
  }
  logger.emit({
    severityText: "WARN",
    body: "Auth failed",
    attributes: { reason },
  });
}

const authMiddleware = async (req, res, next) => {
  try {
    console.log("Request Headers:", req.headers);

    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      recordAuthFailure("No token or invalid token format");
      return res.status(401).json({ message: "No token or invalid token format" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      recordAuthFailure("Token not provided");
      return res.status(401).json({ message: "Token not provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("Decoded Token:", decoded);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      recordAuthFailure("User not found");
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    console.log("Authenticated user:", req.user);

    const span = trace.getActiveSpan();
    if (span) {
      span.addEvent("auth.success", {
        "user.id": user._id.toString(),
        "user.role": user.role,
      });
    }
    logger.emit({
      severityText: "INFO",
      body: "Auth success",
      attributes: { "user.role": user.role },
    });

    next();
  } catch (error) {
    console.error("Auth Error:", error);
    recordAuthFailure("Invalid token");
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;
