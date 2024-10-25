import { logger } from "../infrastructure/utils/combine_log";
import IAdminRepository from "../interfaces/repositories/IAdmin_repository";
import IJwtToken from "../interfaces/utils/IJwt_token";
import { IBlog } from "../domain/entities/blogs";
import IFileStorageService from "../interfaces/utils/IFile_storage_service";

class AdminUsecase {
  constructor(
    private adminRepository: IAdminRepository,
    private jwtToken: IJwtToken,
    private fileStrorageService: IFileStorageService,
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

  async rejectServiceProvider(sp_id: string) {
    const sp = await this.adminRepository.rejectServiceProvider(sp_id);
    return sp;
  }

  async addCategory(categoryName: string, subCategories: string[]) {
    const addedCategory = await this.adminRepository.addCategory(
      categoryName,
      subCategories,
    );
    if (addedCategory) {
      return { success: true, message: "Category added successfully" };
    } else {
      throw new Error("Failed to add Category");
    }
  }

  async findAllCategories(page: number, limit: number) {
    const { categorys, total } = await this.adminRepository.findAllCategories(
      page,
      limit,
    );
    return { categorys, total };
  }

  async unlistCategory(categoryId: string) {
    const categoryUnlist =
      await this.adminRepository.unlistCategory(categoryId);
    return categoryUnlist;
  }

  async addBlog(blogData: Partial<IBlog>, file: any): Promise<IBlog> {
    console.log("data:", blogData);
    console.log("file:", file);

    // Upload the image to Cloudinary
    const imageUrl = await this.fileStrorageService.uploadFiles(file, "image");
    console.log("imgUrl", imageUrl);

    blogData.image = imageUrl;

    const blog = await this.adminRepository.addBlog(blogData);
    return blog;
  }

  async listBlogs(page: number, limit: number) {
    const { blogs, total } = await this.adminRepository.listBlogs(page, limit);
    return { blogs, total };
  }

  async unlistBlog(blogId: string) {
    if (!blogId) {
      throw new Error("Blog ID is required");
    }
    return await this.adminRepository.unlistBlog(blogId);
  }
  async updateBlogStatus(blogId: string, isListed: boolean): Promise<IBlog> {
    try {
      return await this.adminRepository.updateBlogStatus(blogId, isListed);
    } catch (error) {
      throw new Error(`Error in use case: `);
    }
  }
  async getAdminBookingsUseCase(page: number, limit: number) {
    const bookings = await this.adminRepository.getAllBookings(page, limit);
    return bookings;
  }

  async getDashboardDetails() {
    const details = await this.adminRepository.dashboardDetails();
    return details;
  }

  async getAllComplaints() {
    return await this.adminRepository.getAllComplaints();
  }

  async respondToComplaint(
    id: string,
    responseMessage: string,
  ): Promise<boolean> {
    return this.adminRepository.respondToComplaint(id, responseMessage);
  }
}

export default AdminUsecase;
