import users from "../database/user_model";
import IUser from "../../domain/entities/user";
import IUser_repository from "../../interfaces/repositories/IUser_repository";
import { logger } from "../utils/combine_log";

class User_repository implements IUser_repository {
  // Create a New User
  async create_user(user: IUser): Promise<IUser | null> {
    try {
      const new_user = new users(user);
      const saved_user = await new_user.save();
      return saved_user;
    } catch (error) {
      logger.error(`can not save the new user ${error}`);
      return null;
    }
  }

  // Find User By Email
  async find_by_email(email: string): Promise<IUser | null> {
    try {
      const exist_user = await users.findOne({ email });
      return exist_user;
    } catch (error) {
      logger.error(`Unable to find user by email ${error}`);
      return null;
    }
  }

  // Find User By User_id
  async find_by_user_id(user_id: string): Promise<IUser | null> {
    try {
      const exist_user = await users.findById({ user_id });
      return exist_user;
    } catch (error) {
      logger.error(`User_id is not exist ${error}`);
      return null;
    }
  }
}

export default User_repository;
