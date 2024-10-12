import IAdminRepository from "../../interfaces/repositories/IAdmin_repository";
import { IAdmin } from "../../domain/entities/admin";
import { logger } from "../../infrastructure/utils/combine_log";
import IUser from "../../domain/entities/user";
import users from "../../infrastructure/database/user_model";
import IService_provider from "../../domain/entities/service_provider";
import { service_provider } from "../../infrastructure/database/service_provider";
import Category from "../../domain/entities/category";
import { CategoryModel } from "../../infrastructure/database/categoryModel";
import { IBlog } from "../../domain/entities/blogs";
import { BlogModel } from "../../infrastructure/database/blogsModel";
import { ScheduledBookingModel } from "../../infrastructure/database/bookingModel";
import ScheduledBooking from "../../domain/entities/booking";
import { Complaint } from "../../infrastructure/database/complaintModel";

class AdminRepository implements IAdminRepository {
  async findByEmail(email: string): Promise<IAdmin | null> {
    const exist_user = await users.findOne({ email });
    if (!exist_user) {
      logger.error("No service provider in this email");
    }
    return exist_user;
  }
  async findAllUsers(
    page: number,
    limit: number,
  ): Promise<{ users: IUser[]; total: number }> {
    const users_list = await users
      .find()
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await users.find().countDocuments();
    if (!users_list) {
      logger.error("failed to list users");
    }
    return {
      users: users_list,
      total,
    };
  }
  async blockUser(userId: string): Promise<boolean> {
    const user = await users.findById(userId);
    if (!user) {
      logger.error("user not found", 404);
    }
    await users.findByIdAndUpdate(userId, { is_blocked: !user?.is_blocked });
    return true;
  }
  async findAllServiceProviders(
    page: number,
    limit: number,
  ): Promise<{ sp: IService_provider[]; total: number }> {
    const sp_list = await service_provider
      .find()
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await service_provider.find().countDocuments();
    if (!sp_list) {
      logger.error("failed to fetch service providers");
    }
    return {
      sp: sp_list,
      total,
    };
  }
  async blockServiceProvider(id: string): Promise<boolean> {
    const sp = await service_provider.findById(id);
    if (!sp) {
      logger.error("sp not found", 404);
    }
    await service_provider.findByIdAndUpdate(id, {
      is_blocked: !sp?.is_blocked,
    });
    return true;
  }
  async approveServiceProvider(id: string): Promise<boolean> {
    const sp = await service_provider.findById(id);
    if (!sp) {
      logger.error("Service provider not found", 404);
      return false;
    }

    await service_provider.findByIdAndUpdate(id, {
      is_approved: "Approved",
    });

    logger.info(`Service provider with ID: ${id} has been approved.`);
    return true;
  }

  async rejectServiceProvider(id: string): Promise<boolean> {
    const sp = await service_provider.findById(id);
    if (!sp) {
      logger.error("Service provider not found", 404);
      return false;
    }

    await service_provider.findByIdAndUpdate(id, {
      is_approved: "Rejected",
    });

    logger.info(`Service provider with ID: ${id} has been rejected.`);
    return true;
  }

  async getServiceProviderDetails(
    id: string,
  ): Promise<IService_provider | null> {
    const spDetails = await service_provider.findById(id);
    if (!spDetails) {
      logger.error("service provider not found");
    }
    return spDetails;
  }

  async addCategory(
    categoryName: string,
    subCategories: string[],
  ): Promise<boolean> {
    const newCategory = new CategoryModel({
      categoryName: categoryName,
      subCategories: subCategories,
    });
    const savedCategory = await newCategory.save();
    if (!savedCategory) {
      throw new Error("Failed to add category in the database");
    }
    return true;
  }

  async findAllCategories(
    page: number,
    limit: number,
  ): Promise<{ categorys: Category[]; total: number }> {
    const categoryList = await CategoryModel.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await CategoryModel.find().countDocuments();
    if (!categoryList) {
      throw new Error("Failed to fetch category from database");
    }
    return { categorys: categoryList, total };
  }

  async unlistCategory(categoryId: string): Promise<Category | null> {
    const category = await CategoryModel.findById(categoryId);
    if (!category) throw new Error("category not found");

    const categoryUnlist = await CategoryModel.findByIdAndUpdate(
      categoryId,
      { isListed: !category.isListed },
      { new: true },
    );
    if (!categoryUnlist) {
      throw new Error("Failed to unlist category");
    }
    return categoryUnlist;
  }

  async addBlog(blogData: Partial<IBlog>): Promise<IBlog> {
    const blog = new BlogModel(blogData);
    console.log("blog", blog);

    await blog.save();
    return blog;
  }

  async listBlogs(
    page: number,
    limit: number,
  ): Promise<{ blogs: IBlog[]; total: number }> {
    const blogs = await BlogModel.find({})
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await BlogModel.countDocuments({});
    return { blogs, total };
  }

  async unlistBlog(blogId: string) {
    if (!blogId) {
      throw new Error("Blog ID is required");
    }

    const blog = await BlogModel.findById(blogId);
    if (!blog) {
      throw new Error("Blog not found");
    }

    blog.isListed = false;
    return await blog.save();
  }

  async updateBlogStatus(blogId: string, isListed: boolean): Promise<IBlog> {
    try {
      const updatedBlog = await BlogModel.findByIdAndUpdate(
        blogId,
        { isListed },
        { new: true },
      ).exec();
      if (!updatedBlog) {
        throw new Error("Blog not found");
      }
      return updatedBlog;
    } catch (error) {
      throw new Error(`Error updating blog status: `);
    }
  }

  async getAllBookings(
    page: number,
    limit: number,
  ): Promise<ScheduledBooking[]> {
    try {
      const skip = (page - 1) * limit;
      const bookings = await ScheduledBookingModel.find()
        .populate({
          path: "serviceProviderId",
          select: "name",
        })
        .populate({
          path: "userId",
          select: "name",
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();

      return bookings;
    } catch (error) {
      console.error("Error fetching bookings:", error);
      throw new Error("Failed to fetch bookings");
    }
  }

  async dashboardDetails(): Promise<any> {
    const providersCount = await service_provider.countDocuments();
    const usersCount = await users.countDocuments();

    const bookings = await ScheduledBookingModel.aggregate([
      {
        $group: { _id: "$status", total: { $sum: 1 } },
      },
    ]);

    const bookingsCount = {
      completed: 0,
      scheduled: 0,
      cancelled: 0,
      refunded: 0,
    };

    bookings.forEach((int) => {
      if (int._id === "Completed") {
        bookingsCount.completed = int.total;
      } else if (int._id === "Scheduled") {
        bookingsCount.scheduled = int.total;
      } else if (int._id === "Cancelled") {
        bookingsCount.cancelled = int.total;
      } else if (int._id === "Refunded") {
        bookingsCount.refunded = int.total;
      }
    });

    const scheduledBookings = await ScheduledBookingModel.find();

    return {
      providersCount,
      usersCount,
      bookingsCount,
      scheduledBookings,
    };
  }
  async getAllComplaints(): Promise<any[]> {
    return await Complaint.find().sort({ createdAt: -1 });
  }

  async respondToComplaint(
    id: string,
    responseMessage: string
  ): Promise<boolean> {
    try {
      const complaint = await Complaint.findById(id).sort({ createdAt: -1 });

      if (!complaint) {
        return false;
      }

      complaint.response = responseMessage;
      complaint.isResolved = true;
      await complaint.save();

      return true;
    } catch (error) {
      console.error("Error responding to complaint:", error);
      return false;
    }
  }
}

export default AdminRepository;
