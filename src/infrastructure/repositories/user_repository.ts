import IUserRepository from "../../interfaces/repositories/IUser_repository";
import IUser from "../../domain/entities/user";
import users from "../../infrastructure/database/user_model";
import { logger } from "../../infrastructure/utils/combine_log";
import IService_provider from "../../domain/entities/service_provider";
import { service_provider } from "../../infrastructure/database/service_provider";

class UserRepository implements IUserRepository {
  async findUserByEmail(email: string): Promise<IUser | null> {
    const exist_user = await users.findOne({ email });
    return exist_user;
  }

  async findUserById(id: string): Promise<IUser | null> {
    const user_data = await users.findById(id);
    if (!user_data) {
      logger.error("cannot find user from this userid");
      throw new Error("user not found");
    }
    return user_data;
  }

  async saveUser(user: IUser): Promise<IUser | null> {
    const new_user = new users(user);
    const save_user = await new_user.save();
    if (!save_user) {
      logger.error("cannot save this user");
    }
    return save_user;
  }

  async updatePassword(userId: string, password: string): Promise<void | null> {
    await users.findByIdAndUpdate(userId, {
      password: password,
    });
  }
  async editProfile(
    userId: string,
    name: string,
    phone_number: string,
  ): Promise<void> {
    await users.findByIdAndUpdate(userId, {
      name: name,
      phone_number: phone_number,
    });
  }

  async getApprovedAndUnblockedProviders(): Promise<IService_provider[]> {
    return service_provider
      .find({ is_approved: true, is_blocked: false })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getServiceProviderDetails(
    id: string,
  ): Promise<IService_provider | null> {
    const serviceProvidersDetails = await service_provider.findById(id);
    if (!serviceProvidersDetails) {
      throw new Error("ServiceProviders not found");
    }
    return serviceProvidersDetails;
  }
}

export default UserRepository;
