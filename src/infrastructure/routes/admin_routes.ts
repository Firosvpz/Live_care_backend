import AdminController from "../../adapters/controllers/admin_controller";
import express from "express";
import AdminRepository from "../../infrastructure/repositories/admin_repository";
import JwtToken from "../../infrastructure/utils/jwt_token";
import AdminUsecase from "../../usecases/admin_usecase";
import adminAuth from "../../infrastructure/middlewares/adminAuth";
import FileStorageService from "../../infrastructure/utils/File_storage";
import { uploadStorage } from "../../infrastructure/middlewares/multer";

const admin_router = express.Router();

const jwt = new JwtToken(process.env.JWT_SECRET_KEY as string);
const adminRepository = new AdminRepository();
const fileStorage = new FileStorageService();

const adminCase = new AdminUsecase(adminRepository, jwt, fileStorage);

const controller = new AdminController(adminCase);

admin_router.post("/admin-login", (req, res, next) =>
  controller.verifyAdminLogin(req, res, next),
);

admin_router.get("/users-list", adminAuth, (req, res, next) =>
  controller.getAllUsers(req, res, next),
);

admin_router.put("/block-user/:userId", adminAuth, (req, res, next) =>
  controller.blockUser(req, res, next),
);

admin_router.get("/sp-list", adminAuth, (req, res, next) =>
  controller.getAllServiceProviders(req, res, next),
);
admin_router.get("/sp-details/:id", adminAuth, (req, res, next) =>
  controller.getSpDetails(req, res, next),
);
admin_router.put("/block-sp/:id", adminAuth, (req, res, next) =>
  controller.blockServiceProvider(req, res, next),
);

admin_router.put("/approve-sp/:id", adminAuth, (req, res, next) =>
  controller.approveServiceProviders(req, res, next),
);

admin_router.put("/reject-sp/:id", adminAuth, (req, res, next) =>
  controller.rejectServiceProviders(req, res, next),
);

admin_router.post("/add-category", adminAuth, (req, res, next) => {
  controller.addCategory(req, res, next);
});

admin_router.get("/categorys-list", adminAuth, (req, res, next) => {
  controller.findAllCategories(req, res, next);
});

admin_router.put("/unlist-category/:id", adminAuth, (req, res, next) => {
  controller.unlistCategory(req, res, next);
});

admin_router.post(
  "/add-blogs",
  adminAuth,
  uploadStorage.single("image"),
  (req, res, next) => controller.addBlog(req, res, next),
);
admin_router.get("/blogs", adminAuth, (req, res, next) =>
  controller.listBlogs(req, res, next),
);
admin_router.put("/unlist-blog/:id", adminAuth, (req, res, next) =>
  controller.unlistBlog(req, res, next),
);
admin_router.put("/blog/:blogId", adminAuth, (req, res, next) =>
  controller.updateBlogStatus(req, res, next),
);

admin_router.get("/bookings", adminAuth, (req, res, next) =>
  controller.getAdminBookingsController(req, res, next),
);

admin_router.get("/dashboard", adminAuth, (req, res, next) =>
  controller.getDashboardDetails(req, res, next),
);

admin_router.get('/complaints', adminAuth,
  (req, res, next) => controller.getAllComplaints(req, res, next)
);

admin_router.put('/respond-to-complaint/:id',  adminAuth,
  (req, res, next) => controller.respondToComplaint(req, res, next)
);


export default admin_router;
