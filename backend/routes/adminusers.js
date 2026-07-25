const express = require("express");

const router = express.Router();

const User = require("../models/User");

const authMiddleware = require("../middleware/authMiddleware");

const { trace } = require("@opentelemetry/api");
const { getLogger, rbacDeniedTotal } = require("../tracing");

const logger = getLogger();

router.get("/", authMiddleware, async (req, res) => {

  console.log("Authorization Header:", req.header("Authorization"));

  console.log("Decoded User:", req.user);



  try {

    if (req.user.role !== "admin") {

      const span = trace.getActiveSpan();

      if (span) {

        span.addEvent("rbac.denied", {

          "user.id": req.user._id.toString(),

          "user.role": req.user.role,

          "attempted.route": req.method + " " + req.originalUrl,

          "required.role": "admin",

        });

        span.setAttribute("rbac.denied", true);

      }

      rbacDeniedTotal.add(1, {
        'attempted.route': req.method + ' ' + req.originalUrl,
        'user.role': req.user.role,
      });

      logger.emit({
        severityText: "WARN",
        body: "RBAC denied",
        attributes: {
          "user.role": req.user.role,
          "attempted.route": req.method + " " + req.originalUrl,
        },
      });

      return res.status(403).json({ message: "Access denied" });

    }



    const users = await User.find();

    res.json(users);

  } catch (error) {

    res.status(500).json({ message: "Server Error" });

  }

});



// ✅ Fetch a single user by ID

router.get("/:id", authMiddleware, async (req, res) => {

  try {

    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });



    res.json(user);

  } catch (error) {

    res.status(500).json({ message: "Server Error" });

  }

});



// ✅ Update user info (Admin only)

router.put("/:id", authMiddleware, async (req, res) => {

  try {

    if (req.user.role !== "admin") {

      const span = trace.getActiveSpan();

      if (span) {

        span.addEvent("rbac.denied", {

          "user.id": req.user._id.toString(),

          "user.role": req.user.role,

          "attempted.route": req.method + " " + req.originalUrl,

          "required.role": "admin",

        });

        span.setAttribute("rbac.denied", true);

      }

      rbacDeniedTotal.add(1, {
        'attempted.route': req.method + ' ' + req.originalUrl,
        'user.role': req.user.role,
      });

      logger.emit({
        severityText: "WARN",
        body: "RBAC denied",
        attributes: {
          "user.role": req.user.role,
          "attempted.route": req.method + " " + req.originalUrl,
        },
      });

      return res.status(403).json({ message: "Access denied" });

    }



    const { username, email, role } = req.body;

    const updatedUser = await User.findByIdAndUpdate(

      req.params.id,

      { username, email, role },

      { new: true, runValidators: true }

    );



    if (!updatedUser) return res.status(404).json({ message: "User not found" });



    res.json(updatedUser);

  } catch (error) {

    res.status(500).json({ message: "Server Error" });

  }

});



// ✅ Delete a user (Admin only)

router.delete("/:id", authMiddleware, async (req, res) => {

  try {

    if (req.user.role !== "admin") {

      const span = trace.getActiveSpan();

      if (span) {

        span.addEvent("rbac.denied", {

          "user.id": req.user._id.toString(),

          "user.role": req.user.role,

          "attempted.route": req.method + " " + req.originalUrl,

          "required.role": "admin",

        });

        span.setAttribute("rbac.denied", true);

      }

      rbacDeniedTotal.add(1, {
        'attempted.route': req.method + ' ' + req.originalUrl,
        'user.role': req.user.role,
      });

      logger.emit({
        severityText: "WARN",
        body: "RBAC denied",
        attributes: {
          "user.role": req.user.role,
          "attempted.route": req.method + " " + req.originalUrl,
        },
      });

      return res.status(403).json({ message: "Access denied" });

    }



    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) return res.status(404).json({ message: "User not found" });



    res.json({ message: "User deleted successfully" });

  } catch (error) {

    res.status(500).json({ message: "Server Error" });

  }

});



module.exports = router;

