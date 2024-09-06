import IUserRepository from '../../interfaces/repositories/IUser_repository';
import IUser from '../../domain/entities/user';
import users from '../../infrastructure/database/user_model';
import { logger } from '../../infrastructure/utils/combine_log';


class UserRepository implements IUserRepository {

  async findUserByEmail(email: string): Promise<IUser | null> {
    const exist_user = await users.findOne({ email })
    return exist_user
  }

  async findUserById(id: string): Promise<IUser | null> {
    const user_data = await users.findById(id)
    if(!user_data){
      logger.error("cannot find user from this userid")
      throw new Error("user not found")
    }
    return user_data
  }

  async saveUser(user: IUser): Promise<IUser | null> {
    const new_user = new users(user)
    const save_user = await new_user.save()
    if(!save_user){
      logger.error("cannot save this user")
    }
    return save_user
  }
}

export default UserRepository