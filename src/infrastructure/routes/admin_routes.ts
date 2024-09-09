import AdminController from "../../adapters/controllers/admin_controller";
import express from "express";
import AdminRepository from "../../infrastructure/repositories/admin_repository";
import JwtToken from "../../infrastructure/utils/jwt_token";
import AdminUsecase from "../../usecases/admin_usecase";

const admin_router = express.Router();

const jwt = new JwtToken(process.env.JWT_SECRET_KEY as string);
const adminRepository = new AdminRepository();

const adminCase = new AdminUsecase(adminRepository, jwt);

const controller = new AdminController(adminCase);

admin_router.post("/admin-login", (req, res, next) =>
  controller.verifyAdminLogin(req, res, next),
);

admin_router.get("/users-list", (req, res, next) =>
  controller.getAllUsers(req, res, next),
);
admin_router.put("/block-user/:userId", (req, res, next) =>
  controller.blockUser(req, res, next),
);

admin_router.get("/sp-list", (req, res, next) =>
  controller.getAllServiceProviders(req, res, next),
);
admin_router.get("/sp-details/:id", (req, res, next) =>
  controller.getSpDetails(req, res, next),
);
admin_router.put("/block-sp/:id", (req, res, next) =>
  controller.blockServiceProvider(req, res, next),
);
admin_router.put("/approve-sp/:id", (req, res, next) =>
  controller.approveServiceProviders(req, res, next),
);

export default admin_router;
