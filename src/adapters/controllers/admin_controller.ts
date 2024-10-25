import AdminUsecase from "../../usecases/admin_usecase";
import { Request, Response, NextFunction } from "express";
// import fs from 'fs';
// import path from "path";

class AdminController {
  constructor(private admin_usecase: AdminUsecase) {}
  async verifyAdminLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const response = await this.admin_usecase.verifyLogin(email, password);
      const token = response.token;
      if (response?.success) {
        const expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
        res.cookie("adminToken", token, {
          expires: expiryDate,
          httpOnly: true,
          secure: true,
          sameSite: "none",
        });
        return res.status(200).json(response);
      }
      return res.status(400).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const { users, total } = await this.admin_usecase.getAllUsers(
        page,
        limit,
      );
      return res.status(200).json({
        success: true,
        data: users,
        total,
        message: "Users list fetched",
      });
    } catch (error) {
      next(error);
    }
  }

  async blockUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;

      const userBlocked = await this.admin_usecase.blockUser(userId);
      console.log("blk", userBlocked);

      if (userBlocked) {
        res.status(200).json({ success: true });
      }
    } catch (error) {
      next(error);
    }
  }

  async getAllServiceProviders(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const { sp, total } = await this.admin_usecase.getAllServiceProviders(
        page,
        limit,
      );
      return res.status(200).json({
        success: true,
        data: sp,
        total,
        message: "ServiceProviders list fetched",
      });
    } catch (error) {
      next(error);
    }
  }

  async getSpDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const spDetails = await this.admin_usecase.serviceProviderDetails(id);
      return res.status(200).json({
        success: true,
        data: spDetails,
        message: "service provider details fetched",
      });
    } catch (error) {
      next(error);
    }
  }

  async approveServiceProviders(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id } = req.params;
      const spApproved = await this.admin_usecase.approveServiceProvider(id);
      if (spApproved) {
        res
          .status(200)
          .json({ success: true, message: "serviceProvider approved" });
      } else {
        res.status(400).json({
          success: false,
          message: "Failed to approve serviceProvider",
        });
      }
    } catch (error) {
      next(error);
    }
  }

  async rejectServiceProviders(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id } = req.params;
      const spRejected = await this.admin_usecase.rejectServiceProvider(id);
      if (spRejected) {
        res
          .status(200)
          .json({ success: true, message: "serviceProvider rejected" });
      } else {
        res.status(400).json({
          success: false,
          message: "Failed to reject serviceProvider",
        });
      }
    } catch (error) {
      next(error);
    }
  }

  async blockServiceProvider(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const blockedSp = await this.admin_usecase.blockServiceProvider(id);

      if (blockedSp) {
        res.status(200).json({
          success: true,
        });
      }
    } catch (error) {
      next(error);
    }
  }

  async addCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { categoryName, subCategories } = req.body;
      if (!categoryName.trim()) {
        return res.status(400).json({
          success: false,
          message: "Categories name should not be empty",
        });
      }
      if (subCategories.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "No Categories added" });
      }

      const categoryAdded = await this.admin_usecase.addCategory(
        categoryName,
        subCategories,
      );
      if (categoryAdded?.success) {
        return res.status(201).json(categoryAdded);
      }
      return res.status(400).json(categoryAdded);
    } catch (error) {
      next(error);
    }
  }

  async findAllCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 3;
      const { categorys, total } = await this.admin_usecase.findAllCategories(
        page,
        limit,
      );
      return res.status(200).json({
        success: true,
        data: categorys,
        total,
        message: "categorys list fetched",
      });
    } catch (error) {
      next(error);
    }
  }

  async unlistCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const unlistCategory = await this.admin_usecase.unlistCategory(id);
      if (unlistCategory) {
        return res.status(200).json({ success: true, data: unlistCategory });
      }
    } catch (error) {
      next(error);
    }
  }

  async addBlog(req: Request, res: Response, next: NextFunction) {
    try {
      const blogData = req.body;
      const file = req.file;

      if (!file) {
        throw new Error("No file uploaded");
      }

      const blog = await this.admin_usecase.addBlog(blogData, file);
      // console.log("blog:", blog);

      // Optionally remove the file from the server if not needed
      // const filePath = path.join(
      //   __dirname,
      //   "../../infrastructure/public/images",
      //   file.filename
      // );
      // fs.unlink(filePath, (err) => {
      //   if (err) {
      //     console.error("Error deleting the file from server", err);
      //   }
      // });

      return res.status(201).json({ success: true, blog });
    } catch (error) {
      next(error);
    }
  }

  async listBlogs(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const { blogs, total } = await this.admin_usecase.listBlogs(page, limit);
      res.status(200).json({ success: true, blogs, total });
    } catch (error) {
      next(error);
    }
  }

  async unlistBlog(req: Request, res: Response, next: NextFunction) {
    try {
      console.log("bl", req.params);

      const { id } = req.params;
      console.log("bl", id);

      const unlistBlog = await this.admin_usecase.unlistBlog(id);
      if (unlistBlog) {
        return res.status(200).json({ success: true, data: unlistBlog });
      }
    } catch (error) {
      next(error);
    }
  }

  async updateBlogStatus(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const { blogId } = req.params;
    const { isListed } = req.body;

    try {
      const updatedBlog = await this.admin_usecase.updateBlogStatus(
        blogId,
        isListed,
      );
      res.status(200).json({ success: true, data: updatedBlog });
    } catch (error) {
      res.status(500).json({ success: false, error });
    }
  }

  async getAdminBookingsController(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const bookings = await this.admin_usecase.getAdminBookingsUseCase(
        page,
        limit,
      );
      return res.status(200).json(bookings);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to get bookings" });
    }
  }

  async getDashboardDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const details = await this.admin_usecase.getDashboardDetails();
      return res.status(200).json({ success: true, data: details });
    } catch (error) {
      next(error);
    }
  }
  async getAllComplaints(req: Request, res: Response, next: NextFunction) {
    try {
      const complaints = await this.admin_usecase.getAllComplaints();
      res.status(200).json(complaints);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch complaints" });
      next(error);
    }
  }

  async respondToComplaint(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params; // Complaint ID
      const { responseMessage } = req.body; // Response message
      console.log("id", id, "re", responseMessage);

      if (!responseMessage) {
        return res
          .status(400)
          .json({ success: false, message: "Response message is required" });
      }

      const response = await this.admin_usecase.respondToComplaint(
        id,
        responseMessage,
      );

      if (response) {
        return res
          .status(200)
          .json({ success: true, message: "Complaint responded successfully" });
      } else {
        return res
          .status(404)
          .json({ success: false, message: "Complaint not found" });
      }
    } catch (error) {
      next(error);
    }
  }
}
export default AdminController;
