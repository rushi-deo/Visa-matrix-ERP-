import express from "express";

import authenticateUser from "../middleware/authenticateUser.js";
import authorizeRoles from "../middleware/authorizeRoles.js";

const router = express.Router();

router.get("/secure-test", authenticateUser, (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Secure test route accessible.",
    user: {
      id: req.user.id,
      email: req.user.email,
    },
  });
});

router.get(
  "/admin-test",
  authenticateUser,
  authorizeRoles("super_admin", "admin"),
  (req, res) => {
    return res.status(200).json({
      success: true,
      message: "Admin test route accessible.",
      user: {
        id: req.user.id,
        email: req.user.email,
      },
      roles: req.userRoles,
    });
  },
);

export default router;
