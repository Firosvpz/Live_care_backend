import ServiceProviderController from "../../adapters/controllers/service_provider_controller";
import express from "express";
import { uploadStorage } from "../../infrastructure/middlewares/multer";
import serviceProviderAuth from "../../infrastructure/middlewares/serviceProviderAuth";
import ServiceProviderRepository from "../../infrastructure/repositories/sp_respository";
import FileStorageService from "../../infrastructure/utils/File_storage";
import GenerateOtp from "../../infrastructure/utils/generate_OTP";
import HashPassword from "../../infrastructure/utils/hash_password";
import JwtToken from "../../infrastructure/utils/jwt_token";
import MailService from "../../infrastructure/utils/mail_service";
import ServiceProviderUsecase from "../../usecases/service_provider_usecase";

const serviceProvider = express.Router();
const otp = new GenerateOtp();
const hash = new HashPassword();
const jwt = new JwtToken(process.env.JWT_SECRET_KEY as string);
const mail = new MailService();
const fileStorage = new FileStorageService();

const spRepository = new ServiceProviderRepository();
const spUsecase = new ServiceProviderUsecase(
  spRepository,
  mail,
  jwt,
  hash,
  otp,
  fileStorage,
);
const spController = new ServiceProviderController(spUsecase);

serviceProvider.post(
  "/sp-register",
  uploadStorage.single("experience_crt"),
  (req, res, next) => {
    spController.verifyServiceProviderEmail(req, res, next);
  },
);

serviceProvider.post("/verify-sp-otp", (req, res, next) => {
  spController.verifyOtp(req, res, next);
});

serviceProvider.post("/resend-sp-otp", (req, res, next) => {
  spController.resendOtp(req, res, next);
});

serviceProvider.post("/sp-login", (req, res, next) => {
  spController.verifyLogin(req, res, next);
});

serviceProvider.post(
  "/verify-details",
  serviceProviderAuth,
  uploadStorage.fields([
    { name: "profile_picture", maxCount: 1 },
    { name: "experience_crt", maxCount: 1 },
  ]),
  (req, res, next) => {
    spController.verifyDetails(req, res, next);
  },
);

serviceProvider.get("/sp-home", serviceProviderAuth, (req, res, next) => {
  spController.home(req, res, next);
});

serviceProvider.get("/categories", (req, res, next) => {
  spController.getCategories(req, res, next);
});

serviceProvider.get("/sp-profile", serviceProviderAuth, (req, res, next) => {
  spController.getProfileDetails(req, res, next);
});

serviceProvider.put("/edit-profile", serviceProviderAuth, (req, res, next) => {
  spController.editProfile(req, res, next);
});

serviceProvider.put("/edit-password", serviceProviderAuth, (req, res, next) => {
  spController.editPassword(req, res, next);
});

serviceProvider.post("/add-slot", serviceProviderAuth, (req, res, next) =>
  spController.addProviderSlot(req, res, next),
);

serviceProvider.get("/get-domains", serviceProviderAuth, (req, res, next) =>
  spController.getDomains(req, res, next),
);

serviceProvider.get("/get-slots", serviceProviderAuth, (req, res, next) =>
  spController.getProviderSlots(req, res, next),
);

serviceProvider.put(
  "/edit-slot/:slotId",
  serviceProviderAuth,
  (req, res, next) => spController.editSlot(req, res, next),
);

serviceProvider.get("/get-bookings", serviceProviderAuth, (req, res, next) =>
  spController.getScheduledBookings(req, res, next),
);

serviceProvider.put(
  "/update-booking-status/:bookingId",
  serviceProviderAuth,
  (req, res, next) => spController.updateBookingStatus(req, res, next),
);

serviceProvider.post(
  "/leave/:bookingId",
  serviceProviderAuth,
  spController.emergencycancelBooking,
);

serviceProvider.get(
  "/recordings/:userId",
  serviceProviderAuth,
  (req, res, next) => {
    spController.getUserPreviousRecordings(req, res, next);
  },
);

serviceProvider.delete(
  "/providers/:serviceProviderId/slots/:slotId",
  (req, res) => spController.deleteSlot(req, res),
);

export default serviceProvider;
