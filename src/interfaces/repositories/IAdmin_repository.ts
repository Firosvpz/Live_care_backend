import { IAdmin } from "../../domain/entities/admin";
import IUser from "../../domain/entities/user";
import IService_provider from "../../domain/entities/service_provider";
import Category from '../../domain/entities/category';
interface IAdminRepository {
  findByEmail(email: string): Promise<IAdmin | null>;
  findAllUsers(
    page: number,
    limit: number,
  ): Promise<{ users: IUser[]; total: number }>;
  blockUser(user_id: string): Promise<boolean>;
  findAllServiceProviders(
    page: number,
    limit: number,
  ): Promise<{ sp: IService_provider[]; total: number }>;
  getServiceProviderDetails(id: string): Promise<IService_provider | null>;
  approveServiceProvider(id: string): Promise<boolean>;
  blockServiceProvider(id: string): Promise<boolean>;
  addCategory(categoryName: string, subCategories: string[]): Promise<boolean>;
  findAllCategories(
    page: number,
    limit: number
  ): Promise<{ categorys: Category[]; total: number }>;
  unlistCategory(id: string): Promise<Category | null>;
}

export default IAdminRepository;