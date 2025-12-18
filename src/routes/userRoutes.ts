import { Router } from "express";
import UserController from "../controllers/userController";
import { authMiddleware } from "../middlewares/authMiddleware";
const router = Router();
const usercontroller=new UserController()
router.post("/register", usercontroller.register)
router.post("/login", usercontroller.login)
router.post("/refresh", usercontroller.refresh);
router.get("/profile", authMiddleware, usercontroller.profile);
router.put('/profile/:userId', usercontroller.updateProfile);
router.post("/verify-twofa", usercontroller.verifyTwoFA.bind(usercontroller));
router.put("/two-fa/:userId", usercontroller.toggleTwoFA);
router.post("/switch-on-twofa",usercontroller.switchOnTwoFA)
router.post("/otp-on-mail/:userId",usercontroller.otpOnMail)
export default router;
