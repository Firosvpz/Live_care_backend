import { logger } from "../infrastructure/utils/combine_log";
import IAdminRepository from "../interfaces/repositories/IAdmin_repository";
import IJwtToken from "../interfaces/utils/IJwt_token";

class AdminUsecase {
  constructor(
    private adminRepository: IAdminRepository,
    private jwtToken: IJwtToken,
  ) {}

  async verifyLogin(email: string, password: string) {
    const adminEmail = process.env.Admin_Email;
    const adminPassword = process.env.Admin_Password;

    if (!adminEmail || !adminPassword) {
      logger.error("can not set env variables");
      throw new Error("");
    }
    if (email !== adminEmail) {
      logger.error("Invalid email");
      throw new Error("");
    }
    if (password !== adminPassword) {
      logger.error("Invalid password");
      throw new Error("");
    }
    const token = this.jwtToken.createJwtToken("adminIdPlaceholder", "admin");
    return {
      success: true,
      adminData: "adminIdPlaceholder",
      token,
    };
  }

  async getAllUsers(page: number, limit: number) {
    const { users, total } = await this.adminRepository.findAllUsers(
      page,
      limit,
    );
    return { users, total };
  }

  async blockUser(userId: string) {
    const userBlocked = await this.adminRepository.blockUser(userId);
    return userBlocked;
  }

  async getAllServiceProviders(page: number, limit: number) {
    const { sp, total } = await this.adminRepository.findAllServiceProviders(
      page,
      limit,
    );
    return { sp, total };
  }

  async serviceProviderDetails(sp_id: string) {
    const spDetails =
      await this.adminRepository.getServiceProviderDetails(sp_id);
    return spDetails;
  }

  async blockServiceProvider(sp_id: string) {
    const spBlocked = await this.adminRepository.blockServiceProvider(sp_id);
    return spBlocked;
  }

  async approveServiceProvider(sp_id: string) {
    const sp = await this.adminRepository.approveServiceProvider(sp_id);
    return sp;
  }

  async addCategory(categoryName: string, subCategories: string[]) {
     const addedCategory = await this.adminRepository.addCategory(categoryName,subCategories)
     if (addedCategory) {
      return { success: true, message: "Category added successfully" };
    }else{
      throw new Error("Failed to add Category");
    }
  }

  async findAllCategories(page: number, limit: number) {
    const { categorys, total } = await this.adminRepository.findAllCategories(
      page,
      limit
    );
    return { categorys, total };
  }

  async unlistCategory(categoryId: string) {
    const categoryUnlist = await this.adminRepository.unlistCategory(
      categoryId
    );
    return categoryUnlist;
  }
}

export default AdminUsecase;
