import UserController from "../../adapters/controllers/user_controller";
import express from "express";
import UserRepository from "../../infrastructure/repositories/user_repository";
import GenerateOtp from "../../infrastructure/utils/generate_OTP";
import HashPassword from "../../infrastructure/utils/hash_password";
import JwtToken from "../../infrastructure/utils/jwt_token";
import MailService from "../../infrastructure/utils/mail_service";
import UserUsecase from "../../usecases/user_usecase";
import userAuth from "../../infrastructure/middlewares/userAuth";

const router = express.Router();

const userRepository = new UserRepository();
const otp = new GenerateOtp();
const hash = new HashPassword();
const jwt = new JwtToken(process.env.JWT_SECRET_KEY as string);
const mail = new MailService();

const userCase = new UserUsecase(userRepository, otp, hash, jwt, mail);
const controller = new UserController(userCase);

router.post("/user-register", (req, res, next) => {
  controller.verifyUserEmail(req, res, next);
});

router.post("/verify-user-otp", (req, res, next) => {
  controller.verifyOtp(req, res, next);
});

router.post("/resend-otp", (req, res, next) => {
  controller.resendOtp(req, res, next);
});

router.post("/user-login", (req, res, next) => {
  controller.verifyLogin(req, res, next);
});

router.get("/user-home", userAuth, (req, res, next) => {
  controller.home(req, res, next);
});

router.post("/logout", userAuth, (req, res, next) => {
  controller.logout(req, res, next);
});
export default router;
