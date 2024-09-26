import IAdminRepository from "../../interfaces/repositories/IAdmin_repository";
import { IAdmin } from "../../domain/entities/admin";
import { logger } from "../../infrastructure/utils/combine_log";
import IUser from "../../domain/entities/user";
import users from "../../infrastructure/database/user_model";
import IService_provider from "../../domain/entities/service_provider";
import { service_provider } from "../../infrastructure/database/service_provider";
import Category from "../../domain/entities/category";
import { CategoryModel } from "../../infrastructure/database/categoryModel";

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
      logger.error("sp not found", 404);
    }
    await service_provider.findByIdAndUpdate(id, {
      is_approved: !sp?.is_approved,
    });
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
}

export default AdminRepository;
